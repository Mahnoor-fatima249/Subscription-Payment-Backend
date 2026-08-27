import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import config from '../config';
import { NotFoundError, BadRequestError, ExternalServiceError } from '../utils/errors';
import { PaginationQuery, PaymentStatus } from '../types';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion as Stripe.LatestApiVersion,
});

export class PaymentService {
  static async createCheckoutSession(data: {
    customerId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
    quantity?: number;
    trialDays?: number;
    couponCode?: string;
    metadata?: Record<string, unknown>;
  }) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new NotFoundError('Plan');
    }

    if (!customer.stripeCustomerId) {
      throw new BadRequestError('Customer not connected to Stripe');
    }

    // Create price
    const price = await stripe.prices.create({
      unit_amount: Math.round(Number(plan.basePrice) * 100),
      currency: plan.currency,
      recurring: {
        interval: this.mapBillingInterval(plan.billingInterval),
      },
      product_data: {
        name: plan.name,
      },
      metadata: {
        planId: plan.id,
      },
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: price.id,
          quantity: data.quantity || 1,
        },
      ],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      payment_method_collection: 'always',
      subscription_data: {
        metadata: {
          planId: plan.id,
          customerId: customer.id,
          ...data.metadata,
        },
      },
    };

    if (data.trialDays && data.trialDays > 0) {
      sessionParams.subscription_data!.trial_period_days = data.trialDays;
    }

    if (data.couponCode) {
      sessionParams.discounts = [{ coupon: data.couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return { sessionId: session.id, url: session.url };
  }

  static async createBillingPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer || !customer.stripeCustomerId) {
      throw new NotFoundError('Stripe customer');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: data.returnUrl,
    });

    return { url: session.url };
  }

  static async attachPaymentMethod(data: {
    customerId: string;
    paymentMethodId: string;
    setAsDefault?: boolean;
  }) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer || !customer.stripeCustomerId) {
      throw new NotFoundError('Stripe customer');
    }

    const paymentMethod = await stripe.paymentMethods.attach(data.paymentMethodId, {
      customer: customer.stripeCustomerId,
    });

    if (data.setAsDefault) {
      await stripe.customers.update(customer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: data.paymentMethodId,
        },
      });
    }

    // Save to database
    return prisma.paymentMethod.create({
      data: {
        customerId: data.customerId,
        stripePaymentMethodId: paymentMethod.id,
        type: paymentMethod.type,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        isDefault: data.setAsDefault || false,
        billingDetails: paymentMethod.billing_details as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async detachPaymentMethod(paymentMethodId: string) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { stripePaymentMethodId: paymentMethodId },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Payment method');
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return prisma.paymentMethod.delete({
      where: { id: paymentMethod.id },
    });
  }

  static async listPaymentMethods(customerId: string) {
    return prisma.paymentMethod.findMany({
      where: { customerId },
      orderBy: { isDefault: 'desc' },
    });
  }

  static async findAll(query: PaginationQuery & { customerId?: string; status?: string }) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', customerId, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(customerId && { customerId }),
      ...(status && { status: status as PaymentStatus }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: { id: true, email: true, firstName: true, lastName: true },
              },
            },
          },
          invoice: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total, page, limit };
  }

  static async findById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
        invoice: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    return payment;
  }

  static async refund(data: { paymentId: string; amount?: number; reason?: string }) {
    const payment = await this.findById(data.paymentId);

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestError('Can only refund successful payments');
    }

    if (!payment.stripeChargeId) {
      throw new BadRequestError('No Stripe charge found');
    }

    const refundAmount = data.amount ? Math.round(data.amount * 100) : Math.round(Number(payment.amount) * 100);

    const refund = await stripe.refunds.create({
      charge: payment.stripeChargeId,
      amount: refundAmount,
      reason: data.reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
      metadata: {
        paymentId: payment.id,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        refundedAmount: {
          increment: data.amount || Number(payment.amount),
        },
      },
    });

    return refund;
  }

  static async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      case 'payment_intent.payment_failed':
        return this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      case 'charge.refunded':
        return this.handleChargeRefunded(event.data.object as Stripe.Charge);
      case 'invoice.payment_failed':
        return this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      default:
        return { received: true };
    }
  }

  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' },
      });

      if (payment.invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: payment.invoiceId },
        });

        if (invoice) {
          const amountPaid = Number(invoice.amountPaid) + Number(payment.amount);
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid,
              status: amountPaid >= Number(invoice.total) ? 'PAID' : 'OPEN',
              paidAt: amountPaid >= Number(invoice.total) ? new Date() : invoice.paidAt,
            },
          });
        }
      }
    }
  }

  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureCode: paymentIntent.last_payment_error?.code,
          failureMessage: paymentIntent.last_payment_error?.message,
        },
      });
    }
  }

  private static async handleChargeRefunded(charge: Stripe.Charge) {
    const payment = await prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAmount: {
            increment: charge.amount_refunded / 100,
          },
        },
      });
    }
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (dbInvoice) {
      await prisma.invoice.update({
        where: { id: dbInvoice.id },
        data: {
          attemptCount: { increment: 1 },
          nextPaymentAttempt: invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000)
            : null,
        },
      });
    }
  }

  private static mapBillingInterval(interval: string): 'day' | 'week' | 'month' | 'year' {
    const mapping: Record<string, 'day' | 'week' | 'month' | 'year'> = {
      DAILY: 'day',
      WEEKLY: 'week',
      MONTHLY: 'month',
      QUARTERLY: 'month',
      YEARLY: 'year',
    };
    return mapping[interval] || 'month';
  }
}