import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import config from '../config';
import { NotFoundError, BadRequestError, ConflictError, ExternalServiceError } from '../utils/errors';
import { CreateSubscriptionInput, UpdateSubscriptionInput, PaginationQuery, SubscriptionStatus } from '../types';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion as Stripe.LatestApiVersion,
});

export class SubscriptionService {
  static async create(data: CreateSubscriptionInput) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'TRIALING', 'PAUSED'],
            },
          },
        },
      },
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

    if (!plan.isActive) {
      throw new BadRequestError('Plan is not active');
    }

    if (customer.subscriptions.length > 0) {
      throw new ConflictError('Customer already has an active subscription');
    }

    let stripeSubscription: Stripe.Subscription | null = null;
    let stripePriceId = `price_${plan.slug}_monthly`;

    // Create Stripe subscription
    if (customer.stripeCustomerId && data.paymentMethodId) {
      try {
        // Attach payment method to customer
        await stripe.paymentMethods.attach(data.paymentMethodId, {
          customer: customer.stripeCustomerId,
        });

        // Set as default payment method
        await stripe.customers.update(customer.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: data.paymentMethodId,
          },
        });

        // Create price if needed
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

        stripePriceId = price.id;

        // Create subscription
        const subscriptionParams: Stripe.SubscriptionCreateParams = {
          customer: customer.stripeCustomerId,
          items: [
            {
              price: stripePriceId,
              quantity: data.quantity || 1,
            },
          ],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            planId: plan.id,
            customerId: customer.id,
          },
        };

        if (data.trialDays && data.trialDays > 0) {
          subscriptionParams.trial_period_days = data.trialDays;
        }

        if (data.couponCode) {
          const coupon = await prisma.coupon.findFirst({
            where: {
              code: data.couponCode,
              isActive: true,
              validFrom: { lte: new Date() },
              OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
              ],
            },
          });

          if (coupon) {
            subscriptionParams.coupon = data.couponCode;
          }
        }

        stripeSubscription = await stripe.subscriptions.create(subscriptionParams);
      } catch (error) {
        console.warn('Stripe subscription creation failed:', error);
      }
    }

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        customerId: data.customerId,
        planId: data.planId,
        stripeSubscriptionId: stripeSubscription?.id,
        stripePriceId,
        status: data.trialDays ? 'TRIALING' : 'ACTIVE',
        quantity: data.quantity || 1,
        trialStart: data.trialDays ? new Date() : null,
        trialEnd: data.trialDays
          ? new Date(Date.now() + data.trialDays * 24 * 60 * 60 * 1000)
          : null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(plan.billingInterval),
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      include: {
        plan: true,
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

    // Apply coupon if provided
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode },
      });

      if (coupon) {
        let discountAmount = 0;
        if (coupon.discountPercent) {
          discountAmount = (Number(plan.basePrice) * Number(coupon.discountPercent)) / 100;
        } else if (coupon.discountAmount) {
          discountAmount = Number(coupon.discountAmount);
        }

        await prisma.subscriptionDiscount.create({
          data: {
            subscriptionId: subscription.id,
            couponId: coupon.id,
            amount: discountAmount,
            startDate: new Date(),
            endDate: data.trialDays
              ? new Date(Date.now() + data.trialDays * 24 * 60 * 60 * 1000)
              : null,
          },
        });

        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { redemptionCount: { increment: 1 } },
        });
      }
    }

    // Log subscription event
    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: subscription.id,
        eventType: 'CREATED',
        newStatus: subscription.status,
        newPlanId: plan.id,
        quantity: data.quantity || 1,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    return subscription;
  }

  static async findAll(query: PaginationQuery & { status?: SubscriptionStatus; customerId?: string }) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { plan: { name: { contains: search, mode: 'insensitive' as const } } },
          { customer: { user: { email: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }),
    };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          plan: true,
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
          _count: {
            select: { invoices: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, limit };
  }

  static async findById(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: {
          include: {
            features: true,
            tiers: true,
          },
        },
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
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        discounts: {
          where: { isActive: true },
          include: { coupon: true },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    return subscription;
  }

  static async update(id: string, data: UpdateSubscriptionInput, performedBy?: string) {
    const subscription = await this.findById(id);

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestError('Cannot update a cancelled subscription');
    }

    const updates: Record<string, unknown> = { ...data };

    // Handle plan change
    if (data.planId && data.planId !== subscription.planId) {
      const newPlan = await prisma.plan.findUnique({
        where: { id: data.planId },
      });

      if (!newPlan) {
        throw new NotFoundError('New plan');
      }

      updates.planId = data.planId;

      // Update Stripe subscription
      if (subscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );

          const newPrice = await stripe.prices.create({
            unit_amount: Math.round(Number(newPlan.basePrice) * 100),
            currency: newPlan.currency,
            recurring: {
              interval: this.mapBillingInterval(newPlan.billingInterval),
            },
            product_data: {
              name: newPlan.name,
            },
            metadata: {
              planId: newPlan.id,
            },
          });

          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            items: [
              {
                id: stripeSubscription.items.data[0].id,
                price: newPrice.id,
                quantity: data.quantity || subscription.quantity,
              },
            ],
            proration_behavior: 'create_prorations',
          });
        } catch (error) {
          console.warn('Stripe subscription update failed:', error);
        }
      }

      // Log plan change event
      await prisma.subscriptionEvent.create({
        data: {
          subscriptionId: id,
          eventType: 'PLAN_CHANGED',
          previousStatus: subscription.status,
          newStatus: subscription.status,
          previousPlanId: subscription.planId,
          newPlanId: data.planId,
          quantity: data.quantity || subscription.quantity,
          performedBy,
        },
      });
    }

    // Handle quantity change
    if (data.quantity && data.quantity !== subscription.quantity) {
      updates.quantity = data.quantity;

      if (subscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );

          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            items: [
              {
                id: stripeSubscription.items.data[0].id,
                quantity: data.quantity,
              },
            ],
            proration_behavior: 'create_prorations',
          });
        } catch (error) {
          console.warn('Stripe subscription update failed:', error);
        }
      }

      await prisma.subscriptionEvent.create({
        data: {
          subscriptionId: id,
          eventType: 'QUANTITY_CHANGED',
          previousStatus: subscription.status,
          newStatus: subscription.status,
          quantity: data.quantity,
          performedBy,
        },
      });
    }

    return prisma.subscription.update({
      where: { id },
      data: updates,
      include: {
        plan: true,
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
  }

  static async cancel(
    id: string,
    reason?: string,
    cancelImmediately = false,
    performedBy?: string
  ) {
    const subscription = await this.findById(id);

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestError('Subscription is already cancelled');
    }

    const cancelAt = cancelImmediately
      ? new Date()
      : subscription.currentPeriodEnd || new Date();

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        if (cancelImmediately) {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        } else {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        }
      } catch (error) {
        console.warn('Stripe subscription cancellation failed:', error);
      }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: cancelImmediately ? 'CANCELLED' : subscription.status,
        cancelAt: cancelImmediately ? null : cancelAt,
        canceledAt: cancelImmediately ? new Date() : null,
        cancelReason: reason as 'CUSTOMER_REQUEST' | undefined,
      },
      include: {
        plan: true,
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

    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: id,
        eventType: cancelImmediately ? 'CANCELLED' : 'CANCEL_SCHEDULED',
        previousStatus: subscription.status,
        newStatus: cancelImmediately ? 'CANCELLED' : subscription.status,
        reason,
        performedBy,
      },
    });

    return updatedSubscription;
  }

  static async pause(id: string, performedBy?: string) {
    const subscription = await this.findById(id);

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestError('Can only pause active subscriptions');
    }

    // Pause in Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          pause_collection: {
            behavior: 'void',
          },
        });
      } catch (error) {
        console.warn('Stripe subscription pause failed:', error);
      }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'PAUSED',
        pauseStart: new Date(),
      },
      include: {
        plan: true,
      },
    });

    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: id,
        eventType: 'PAUSED',
        previousStatus: subscription.status,
        newStatus: 'PAUSED',
        performedBy,
      },
    });

    return updatedSubscription;
  }

  static async resume(id: string, performedBy?: string) {
    const subscription = await this.findById(id);

    if (subscription.status !== 'PAUSED') {
      throw new BadRequestError('Can only resume paused subscriptions');
    }

    // Resume in Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          pause_collection: '',
        });
      } catch (error) {
        console.warn('Stripe subscription resume failed:', error);
      }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        pauseStart: null,
        resumeAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(subscription.plan?.billingInterval || 'MONTHLY'),
      },
      include: {
        plan: true,
      },
    });

    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: id,
        eventType: 'RESUMED',
        previousStatus: 'PAUSED',
        newStatus: 'ACTIVE',
        performedBy,
      },
    });

    return updatedSubscription;
  }

  static async getUpcomingInvoice(id: string) {
    const subscription = await this.findById(id);

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestError('No Stripe subscription found');
    }

    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        subscription: subscription.stripeSubscriptionId,
      });

      return {
        subtotal: invoice.subtotal / 100,
        total: invoice.total / 100,
        lines: invoice.lines.data.map((line) => ({
          description: line.description,
          amount: line.amount / 100,
          quantity: line.quantity,
          period: line.period,
        })),
      };
    } catch (error) {
      throw new ExternalServiceError('Stripe', 'Failed to retrieve upcoming invoice');
    }
  }

  static async getEvents(id: string) {
    return prisma.subscriptionEvent.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: 'desc' },
    });
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

  private static calculatePeriodEnd(interval: string): Date {
    const now = new Date();
    switch (interval) {
      case 'DAILY':
        return new Date(now.setDate(now.getDate() + 1));
      case 'WEEKLY':
        return new Date(now.setDate(now.getDate() + 7));
      case 'MONTHLY':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'QUARTERLY':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'YEARLY':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  }
}
