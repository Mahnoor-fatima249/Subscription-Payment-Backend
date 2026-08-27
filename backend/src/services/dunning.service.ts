import Stripe from 'stripe';
import prisma from '../utils/prisma';
import config from '../config';
import { BadRequestError } from '../utils/errors';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion as Stripe.LatestApiVersion,
});

export class DunningService {
  static readonly DEFAULT_CONFIG = {
    maxRetries: 4,
    retryIntervals: [1, 3, 7, 14], // days
    gracePeriodDays: 7,
  };

  static async processFailedPayments() {
    const failedInvoices = await prisma.invoice.findMany({
      where: {
        status: 'OPEN',
        attemptCount: { lt: this.DEFAULT_CONFIG.maxRetries },
        nextPaymentAttempt: { lte: new Date() },
      },
      include: {
        customer: {
          include: {
            user: { select: { email: true, firstName: true, lastName: true } },
            paymentMethods: { where: { isDefault: true } },
          },
        },
        subscription: { include: { plan: true } },
      },
    });

    const results = [];

    for (const invoice of failedInvoices) {
      try {
        const result = await this.retryPayment(invoice);
        results.push({ invoiceId: invoice.id, success: true, ...result });
      } catch (error) {
        results.push({
          invoiceId: invoice.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  static async retryPayment(invoice: any) {
    if (!invoice.customer.stripeCustomerId) {
      throw new BadRequestError('Customer not connected to Stripe');
    }

    // Get default payment method
    const defaultPaymentMethod = invoice.customer.paymentMethods[0];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(invoice.amountDue) * 100),
      currency: invoice.currency,
      customer: invoice.customer.stripeCustomerId,
      payment_method: defaultPaymentMethod?.stripePaymentMethodId || undefined,
      confirm: true,
      off_session: true,
      metadata: {
        invoiceId: invoice.id,
        retryAttempt: invoice.attemptCount + 1,
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      await prisma.payment.create({
        data: {
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          stripePaymentIntentId: paymentIntent.id,
          status: 'SUCCEEDED',
          amount: invoice.amountDue,
          currency: invoice.currency,
        },
      });

      // Update invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          amountPaid: { increment: invoice.amountDue },
          amountDue: 0,
          paidAt: new Date(),
        },
      });

      // Send success notification
      await this.sendNotification(invoice.customer.user, 'payment_succeeded', invoice);

      return { paymentIntentId: paymentIntent.id, status: 'succeeded' };
    } else {
      // Payment failed - schedule next retry
      const nextRetryDay = this.DEFAULT_CONFIG.retryIntervals[invoice.attemptCount] || 14;
      const nextAttempt = new Date();
      nextAttempt.setDate(nextAttempt.getDate() + nextRetryDay);

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          attemptCount: { increment: 1 },
          nextPaymentAttempt: nextAttempt,
        },
      });

      // Send failure notification
      await this.sendNotification(invoice.customer.user, 'payment_failed_retry', invoice, nextRetryDay);

      if (invoice.attemptCount + 1 >= this.DEFAULT_CONFIG.maxRetries) {
        // Mark as uncollectible after max retries
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'UNCOLLECTIBLE' },
        });
        await this.sendNotification(invoice.customer.user, 'payment_failed_final', invoice);
      }

      return { status: 'failed', nextRetryInDays: nextRetryDay };
    }
  }

  static async getDunningStatus(customerId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId,
        status: { in: ['OPEN', 'UNCOLLECTIBLE'] },
        amountDue: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((invoice) => ({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amountDue: Number(invoice.amountDue),
      attemptCount: invoice.attemptCount,
      nextAttempt: invoice.nextPaymentAttempt,
      status: invoice.status,
      createdAt: invoice.createdAt,
    }));
  }

  static async pauseDunning(invoiceId: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { nextPaymentAttempt: null },
    });
  }

  static async resumeDunning(invoiceId: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { nextPaymentAttempt: new Date() },
    });
  }

  private static async sendNotification(
    user: any,
    type: string,
    invoice: any,
    extraData?: any
  ) {
    const templates: Record<string, { title: string; message: string }> = {
      payment_succeeded: {
        title: 'Payment Successful',
        message: `Your payment of $${invoice.amountDue} for invoice ${invoice.invoiceNumber} was successful.`,
      },
      payment_failed_retry: {
        title: 'Payment Failed - Retry Scheduled',
        message: `Your payment for invoice ${invoice.invoiceNumber} failed. We'll retry in ${extraData} day(s).`,
      },
      payment_failed_final: {
        title: 'Payment Failed - Action Required',
        message: `Your payment for invoice ${invoice.invoiceNumber} has failed after multiple attempts. Please update your payment method.`,
      },
    };

    const template = templates[type];
    if (!template) return;

    await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title: template.title,
        message: template.message,
        metadata: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
      },
    });

    // In production, send email here
    console.log(`Notification to ${user.email}: ${template.title}`);
  }

  static async getDunningMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalFailed,
      recovered,
      uncollectible,
      totalAmountFailed,
      totalAmountRecovered,
    ] = await Promise.all([
      prisma.invoice.count({
        where: {
          status: 'UNCOLLECTIBLE',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.invoice.count({
        where: {
          status: 'PAID',
          attemptCount: { gt: 0 },
          paidAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.invoice.count({
        where: { status: 'UNCOLLECTIBLE' },
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'UNCOLLECTIBLE',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amountDue: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          attemptCount: { gt: 0 },
          paidAt: { gte: thirtyDaysAgo },
        },
        _sum: { amountPaid: true },
      }),
    ]);

    return {
      recoveryRate: totalFailed > 0 ? (recovered / (totalFailed + recovered)) * 100 : 0,
      totalFailedInvoices: totalFailed,
      recoveredInvoices: recovered,
      uncollectibleInvoices: uncollectible,
      amountFailed: Number(totalAmountFailed._sum.amountDue || 0),
      amountRecovered: Number(totalAmountRecovered._sum.amountPaid || 0),
    };
  }
}