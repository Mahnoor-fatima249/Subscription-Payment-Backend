import Stripe from 'stripe';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import config from '../config';
import { ExternalServiceError, IdempotencyError } from '../utils/errors';
import { StripeWebhookEvent } from '../types';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion as Stripe.LatestApiVersion,
});

export class WebhookService {
  static verifySignature(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error) {
      throw new ExternalServiceError('Stripe', 'Webhook signature verification failed');
    }
  }

  static async processEvent(event: Stripe.Event) {
    const eventId = event.id;

    // Check if already processed (idempotency)
    const existing = await prisma.webhookEvent.findUnique({
      where: { externalId: eventId },
    });

    if (existing) {
      if (existing.status === 'processed') {
        return { received: true, alreadyProcessed: true };
      }
      if (existing.retryCount >= existing.maxRetries) {
        return { received: true, maxRetriesExceeded: true };
      }
    }

    // Create or update webhook event record
    await prisma.webhookEvent.upsert({
      where: { externalId: eventId },
      create: {
        externalId: eventId,
        source: 'STRIPE',
        eventType: event.type,
        payload: JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue,
        status: 'pending',
        retryCount: existing?.retryCount || 0,
      },
      update: {
        status: 'pending',
        retryCount: { increment: 1 },
      },
    });

    try {
      await this.handleEvent(event);

      // Mark as processed
      await prisma.webhookEvent.update({
        where: { externalId: eventId },
        data: { status: 'processed', processedAt: new Date() },
      });

      return { received: true, processed: true };
    } catch (error) {
      // Update error status
      await prisma.webhookEvent.update({
        where: { externalId: eventId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  private static async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      // Subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.trial_will_end':
        await this.handleTrialEnding(event.data.object as Stripe.Subscription);
        break;

      // Invoice events
      case 'invoice.created':
      case 'invoice.updated':
        await this.handleInvoiceChange(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.finalized':
        await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      // Payment events
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'charge.refunded':
      case 'charge.dispute.created':
        await this.handlePaymentEvent(event);
        break;

      // Customer events
      case 'customer.updated':
      case 'customer.deleted':
        await this.handleCustomerChange(event.data.object as Stripe.Customer);
        break;

      // Payment method events
      case 'payment_method.attached':
      case 'payment_method.detached':
      case 'payment_method.updated':
        await this.handlePaymentMethodChange(event.data.object as Stripe.PaymentMethod);
        break;

      // Checkout events
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  }

  private static async handleSubscriptionChange(subscription: Stripe.Subscription) {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      // Try to find by metadata
      const metaSubscription = await prisma.subscription.findFirst({
        where: { metadata: { path: ['stripeSubscriptionId'], equals: subscription.id } },
      });
      if (!metaSubscription) return;
    }

    const targetSubscription = dbSubscription!;
    const previousStatus = targetSubscription.status;

    // Map Stripe status to our status
    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELLED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
      paused: 'PAUSED',
    };

    const newStatus = statusMap[subscription.status] || 'ACTIVE';

    // Calculate period dates
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await prisma.subscription.update({
      where: { id: targetSubscription.id },
      data: {
        status: newStatus as any,
        currentPeriodStart,
        currentPeriodEnd,
        quantity: subscription.items.data[0]?.quantity || 1,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        pauseStart: subscription.pause_collection?.behavior
          ? new Date(subscription.current_period_start * 1000)
          : null,
        metadata: subscription.metadata as Prisma.InputJsonValue,
      },
    });

    // Log event
    if (previousStatus !== newStatus) {
      await prisma.subscriptionEvent.create({
data: {
            subscriptionId: targetSubscription.id,
            eventType: 'STRIPE_STATUS_CHANGE',
            previousStatus,
            newStatus,
            metadata: { stripeEvent: 'customer.subscription.updated' },
          },
        });
      }

      // Handle plan change
      if (subscription.metadata?.planId && subscription.metadata.planId !== targetSubscription.planId) {
        await prisma.subscriptionEvent.create({
          data: {
            subscriptionId: targetSubscription.id,
            eventType: 'PLAN_CHANGED',
            previousStatus,
            newStatus,
            previousPlanId: targetSubscription.planId,
            newPlanId: subscription.metadata.planId,
            metadata: { stripeEvent: 'customer.subscription.updated' },
          },
        });
      }
    }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) return;

    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: 'CANCELLED',
        canceledAt: new Date(),
      },
    });

    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: dbSubscription.id,
        eventType: 'CANCELLED',
        previousStatus: dbSubscription.status,
        newStatus: 'CANCELLED',
        metadata: { stripeEvent: 'customer.subscription.deleted' },
      },
    });
  }

  private static async handleTrialEnding(subscription: Stripe.Subscription) {
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: { customer: true, plan: true },
    });

    if (!dbSubscription) return;

    // Notify customer about trial ending
    await prisma.notification.create({
      data: {
        userId: dbSubscription.customer.userId,
        type: 'trial_ending',
        title: 'Trial Ending Soon',
        message: `Your trial for ${dbSubscription.plan.name} ends in 3 days.`,
        metadata: { subscriptionId: dbSubscription.id },
      },
    });
  }

  private static async handleInvoiceChange(invoice: Stripe.Invoice) {
    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (!dbInvoice) return;

    const statusMap: Record<string, 'DRAFT' | 'OPEN' | 'PAID' | 'UNCOLLECTIBLE' | 'VOID'> = {
      draft: 'DRAFT',
      open: 'OPEN',
      paid: 'PAID',
      uncollectible: 'UNCOLLECTIBLE',
      void: 'VOID',
    };

    await prisma.invoice.update({
      where: { id: dbInvoice.id },
      data: {
        status: invoice.status ? (statusMap[invoice.status] || 'OPEN') : 'OPEN',
        amountPaid: invoice.amount_paid / 100,
        amountDue: invoice.amount_due / 100,
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        paidAt: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : null,
        attemptCount: invoice.attempt_count,
        nextPaymentAttempt: invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000)
          : null,
        periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
        periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      },
    });
  }

  private static async handleInvoicePaid(invoice: Stripe.Invoice) {
    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (!dbInvoice) return;

    await prisma.invoice.update({
      where: { id: dbInvoice.id },
      data: {
        status: 'PAID',
        amountPaid: invoice.amount_paid / 100,
        amountDue: 0,
        paidAt: new Date(),
      },
    });

    // Create payment record if not exists
    const existingPayment = await prisma.payment.findFirst({
      where: { invoiceId: dbInvoice.id },
    });

    if (!existingPayment && invoice.payment_intent) {
      await prisma.payment.create({
        data: {
          customerId: dbInvoice.customerId,
          invoiceId: dbInvoice.id,
          stripePaymentIntentId: invoice.payment_intent as string,
          stripeChargeId: invoice.charge as string,
          status: 'SUCCEEDED',
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
        },
      });
    }
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (!dbInvoice) return;

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

  private static async handleInvoiceFinalized(invoice: Stripe.Invoice) {
    const dbInvoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (!dbInvoice) return;

    await prisma.invoice.update({
      where: { id: dbInvoice.id },
      data: { status: 'OPEN' },
    });
  }

  private static async handlePaymentEvent(event: Stripe.Event) {
    // Handled by payment service
    const { PaymentService } = await import('./payment.service');
    await PaymentService.handleStripeEvent(event);
  }

  private static async handleCustomerChange(customer: Stripe.Customer) {
    const dbCustomer = await prisma.customer.findFirst({
      where: { stripeCustomerId: customer.id },
    });

    if (!dbCustomer) return;

    await prisma.customer.update({
      where: { id: dbCustomer.id },
      data: {
        phone: customer.phone,
        addressLine1: customer.address?.line1,
        addressLine2: customer.address?.line2,
        city: customer.address?.city,
        state: customer.address?.state,
        postalCode: customer.address?.postal_code,
        country: customer.address?.country,
      },
    });
  }

  private static async handlePaymentMethodChange(paymentMethod: Stripe.PaymentMethod) {
    const dbPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { stripePaymentMethodId: paymentMethod.id },
    });

    if (!dbPaymentMethod) return;

    if (paymentMethod.customer === null) {
      // Detached
      await prisma.paymentMethod.delete({ where: { id: dbPaymentMethod.id } });
    } else {
      // Attached or updated
      await prisma.paymentMethod.update({
        where: { id: dbPaymentMethod.id },
        data: {
          type: paymentMethod.type,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
          billingDetails: paymentMethod.billing_details as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    // Subscription already created via webhook, just log
    console.log(`Checkout completed for session: ${session.id}`);
  }

  static async getWebhookLogs(limit = 50) {
    return prisma.webhookEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async retryFailedWebhooks() {
    const failedEvents = await prisma.webhookEvent.findMany({
      where: {
        status: 'failed',
        retryCount: { lt: 3 },
      },
    });

    for (const event of failedEvents) {
      try {
        const stripeEvent = event.payload as unknown as Stripe.Event;
        await this.handleEvent(stripeEvent);

        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: { status: 'processed', processedAt: new Date() },
        });
      } catch (error) {
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: {
            retryCount: { increment: 1 },
            error: error instanceof Error ? error.message : 'Retry failed',
          },
        });
      }
    }
  }
}