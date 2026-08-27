import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import config from '../config';
import { NotFoundError, BadRequestError, ExternalServiceError } from '../utils/errors';
import { CreateInvoiceInput, PaginationQuery, InvoiceStatus } from '../types';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion as Stripe.LatestApiVersion,
});

export class InvoiceService {
  static async create(data: CreateInvoiceInput) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    if (data.subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: data.subscriptionId },
      });

      if (!subscription) {
        throw new NotFoundError('Subscription');
      }
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Create invoice in database
    const invoice = await prisma.invoice.create({
      data: {
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        invoiceNumber,
        status: 'DRAFT',
        currency: 'usd',
        subtotal,
        total: subtotal,
        amountDue: subtotal,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        periodStart: data.items[0]?.periodStart
          ? new Date(data.items[0].periodStart)
          : new Date(),
        periodEnd: data.items[0]?.periodEnd
          ? new Date(data.items[0].periodEnd)
          : new Date(),
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            periodStart: item.periodStart ? new Date(item.periodStart) : null,
            periodEnd: item.periodEnd ? new Date(item.periodEnd) : null,
          })),
        },
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      include: {
        items: true,
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return invoice;
  }

  static async findAll(query: PaginationQuery & { status?: InvoiceStatus; customerId?: string }) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
          { customer: { user: { email: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          subscription: {
            include: {
              plan: true,
            },
          },
          items: true,
          payments: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total, page, limit };
  }

  static async findById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            paymentMethods: true,
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    return invoice;
  }

  static async finalize(id: string) {
    const invoice = await this.findById(id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestError('Can only finalize draft invoices');
    }

    return prisma.invoice.update({
      where: { id },
      data: { status: 'OPEN' },
      include: {
        items: true,
      },
    });
  }

  static async pay(id: string, paymentMethodId?: string) {
    const invoice = await this.findById(id);

    if (invoice.status !== 'OPEN') {
      throw new BadRequestError('Can only pay open invoices');
    }

    let stripePaymentIntent: Stripe.PaymentIntent | null = null;

    if (invoice.customer.stripeCustomerId) {
      try {
        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
          amount: Math.round(Number(invoice.total) * 100),
          currency: invoice.currency,
          customer: invoice.customer.stripeCustomerId,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
          },
        };

        if (paymentMethodId) {
          paymentIntentParams.payment_method = paymentMethodId;
          paymentIntentParams.confirm = true;
          paymentIntentParams.automatic_payment_methods = undefined;
        }

        stripePaymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      } catch (error) {
        console.warn('Stripe payment intent creation failed:', error);
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        stripePaymentIntentId: stripePaymentIntent?.id,
        status: stripePaymentIntent?.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
        amount: invoice.total,
        currency: invoice.currency,
        paymentMethod: paymentMethodId,
      },
    });

    // Update invoice status
    if (payment.status === 'SUCCEEDED') {
      await prisma.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          amountPaid: invoice.total,
          paidAt: new Date(),
        },
      });
    }

    return payment;
  }

  static async void(id: string) {
    const invoice = await this.findById(id);

    if (invoice.status === 'PAID') {
      throw new BadRequestError('Cannot void a paid invoice');
    }

    if (invoice.stripeInvoiceId) {
      try {
        await stripe.invoices.voidInvoice(invoice.stripeInvoiceId);
      } catch (error) {
        console.warn('Stripe invoice void failed:', error);
      }
    }

    return prisma.invoice.update({
      where: { id },
      data: { status: 'VOID' },
    });
  }

  static async send(id: string) {
    const invoice = await this.findById(id);

    if (invoice.status !== 'OPEN') {
      throw new BadRequestError('Can only send open invoices');
    }

    if (invoice.stripeInvoiceId) {
      try {
        await stripe.invoices.sendInvoice(invoice.stripeInvoiceId);
      } catch (error) {
        console.warn('Stripe invoice send failed:', error);
      }
    }

    return invoice;
  }

  static async upcoming(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestError('No Stripe subscription found');
    }

    try {
      const upcoming = await stripe.invoices.retrieveUpcoming({
        subscription: subscription.stripeSubscriptionId,
      });

      return {
        subtotal: upcoming.subtotal / 100,
        total: upcoming.total / 100,
        periodStart: new Date(upcoming.period_start * 1000),
        periodEnd: new Date(upcoming.period_end * 1000),
        lines: upcoming.lines.data.map((line) => ({
          description: line.description,
          amount: line.amount / 100,
          quantity: line.quantity,
        })),
      };
    } catch (error) {
      throw new ExternalServiceError('Stripe', 'Failed to retrieve upcoming invoice');
    }
  }

  static async generateForSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: {
          include: {
            tiers: true,
          },
        },
        customer: true,
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestError('Can only generate invoices for active subscriptions');
    }

    // Get usage for the period
    const usages = await prisma.usage.findMany({
      where: {
        subscriptionId,
        periodStart: {
          gte: subscription.currentPeriodStart || new Date(),
        },
      },
    });

    // Calculate amount based on billing model
    let subtotal = Number(subscription.plan.basePrice);

    if (subscription.plan.billingModel === 'USAGE_BASED') {
      // Calculate based on usage
      const totalUsage = usages.reduce((sum, usage) => sum + Number(usage.quantity), 0);

      // Apply tiered pricing if available
      if (subscription.plan.tiers.length > 0) {
        let remaining = totalUsage;
        subtotal = 0;

        for (const tier of subscription.plan.tiers.sort((a, b) => a.upTo - b.upTo)) {
          const applicable = Math.min(remaining, tier.upTo);
          subtotal += applicable * Number(tier.perUnitPrice) + Number(tier.flatFee);
          remaining -= applicable;

          if (remaining <= 0) break;
        }

        if (remaining > 0) {
          const lastTier = subscription.plan.tiers[subscription.plan.tiers.length - 1];
          subtotal += remaining * Number(lastTier.perUnitPrice);
        }
      } else {
        subtotal = totalUsage * Number(subscription.plan.basePrice);
      }
    } else if (subscription.plan.billingModel === 'PER_SEAT') {
      subtotal = Number(subscription.plan.basePrice) * subscription.quantity;
    } else if (subscription.plan.billingModel === 'TIERED') {
      // Apply tiered pricing
      if (subscription.plan.tiers.length > 0) {
        let remaining = subscription.quantity;
        subtotal = 0;

        for (const tier of subscription.plan.tiers.sort((a, b) => a.upTo - b.upTo)) {
          const applicable = Math.min(remaining, tier.upTo);
          subtotal += applicable * Number(tier.perUnitPrice) + Number(tier.flatFee);
          remaining -= applicable;

          if (remaining <= 0) break;
        }
      }
    }

    // Apply discounts
    const discounts = await prisma.subscriptionDiscount.findMany({
      where: {
        subscriptionId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: { coupon: true },
    });

    let discountAmount = 0;
    for (const discount of discounts) {
      discountAmount += Number(discount.amount);
    }

    const total = Math.max(0, subtotal - discountAmount);

    // Create invoice
    return this.create({
      customerId: subscription.customerId,
      subscriptionId,
      items: [
        {
          description: `${subscription.plan.name} - ${subscription.plan.billingInterval}`,
          quantity: subscription.quantity,
          unitPrice: Number(subscription.plan.basePrice),
          periodStart: subscription.currentPeriodStart?.toISOString(),
          periodEnd: subscription.currentPeriodEnd?.toISOString(),
        },
      ],
    });
  }
}
