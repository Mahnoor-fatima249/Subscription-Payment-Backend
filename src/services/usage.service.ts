import prisma from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { RecordUsageInput, PaginationQuery } from '../types';

export class UsageService {
  static async record(data: RecordUsageInput) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
      include: { plan: { include: { features: true } }, customer: true },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (subscription.customerId !== data.customerId) {
      throw new BadRequestError('Subscription does not belong to this customer');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestError('Can only record usage for active subscriptions');
    }

    const now = data.timestamp ? new Date(data.timestamp) : new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Check if metric exists in plan features
    const metric = subscription.plan.features.find(
      (f) => f.name === data.metricName && f.isLimit
    );

    if (!metric && subscription.plan.billingModel === 'USAGE_BASED') {
      throw new BadRequestError(`Metric ${data.metricName} not defined in plan`);
    }

    // Check limit if applicable
    if (metric && metric.limitValue) {
      const currentUsage = await this.getCurrentPeriodUsage(
        data.customerId,
        data.subscriptionId,
        data.metricName
      );

      if (currentUsage + data.quantity > metric.limitValue) {
        throw new BadRequestError(
          `Usage limit exceeded. Maximum: ${metric.limitValue}, Current: ${currentUsage}`
        );
      }
    }

    const usage = await prisma.usage.create({
      data: {
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        metricName: data.metricName,
        quantity: data.quantity,
        timestamp: now,
        periodStart,
        periodEnd,
      },
    });

    return usage;
  }

  static async recordBatch(usages: RecordUsageInput[]) {
    // Validate all usages first
    for (const usage of usages) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: usage.subscriptionId },
        include: { plan: { include: { features: true } } },
      });

      if (!subscription) {
        throw new NotFoundError(`Subscription ${usage.subscriptionId}`);
      }

      if (subscription.customerId !== usage.customerId) {
        throw new BadRequestError(`Subscription ${usage.subscriptionId} does not belong to customer ${usage.customerId}`);
      }
    }

    // Create all usages in a single transaction
    return prisma.$transaction(
      usages.map((usage) =>
        prisma.usage.create({
          data: {
            customerId: usage.customerId,
            subscriptionId: usage.subscriptionId,
            metricName: usage.metricName,
            quantity: usage.quantity,
            timestamp: usage.timestamp ? new Date(usage.timestamp) : new Date(),
            periodStart: new Date(new Date(usage.timestamp || Date.now()).getFullYear(), new Date(usage.timestamp || Date.now()).getMonth(), 1),
            periodEnd: new Date(new Date(usage.timestamp || Date.now()).getFullYear(), new Date(usage.timestamp || Date.now()).getMonth() + 1, 0),
          },
        })
      )
    );
  }

  static async getCurrentPeriodUsage(
    customerId: string,
    subscriptionId: string,
    metricName: string
  ): Promise<number> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await prisma.usage.aggregate({
      where: {
        customerId,
        subscriptionId,
        metricName,
        timestamp: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: { quantity: true },
    });

    return Number(result._sum.quantity || 0);
  }

  static async getUsage(query: PaginationQuery & {
    customerId?: string;
    subscriptionId?: string;
    metricName?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }) {
    const { page = 1, limit = 50, sortBy = 'timestamp', sortOrder = 'desc',
      customerId, subscriptionId, metricName, periodStart, periodEnd } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (subscriptionId) where.subscriptionId = subscriptionId;
    if (metricName) where.metricName = metricName;
    if (periodStart || periodEnd) {
      where.timestamp = {};
      if (periodStart) (where.timestamp as Record<string, unknown>).gte = periodStart;
      if (periodEnd) (where.timestamp as Record<string, unknown>).lte = periodEnd;
    }

    const [usages, total] = await Promise.all([
      prisma.usage.findMany({
        where,
        include: {
          subscription: {
            include: { plan: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.usage.count({ where }),
    ]);

    return { usages, total, page, limit };
  }

  static async getUsageSummary(customerId: string, subscriptionId: string, periodStart: Date, periodEnd: Date) {
    const usages = await prisma.usage.groupBy({
      by: ['metricName'],
      where: {
        customerId,
        subscriptionId,
        timestamp: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: { quantity: true },
    });

    return usages.map((u) => ({
      metricName: u.metricName,
      totalQuantity: Number(u._sum.quantity || 0),
    }));
  }

  static async getUsageByPeriod(subscriptionId: string, metricName: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const usages = await prisma.usage.findMany({
      where: {
        subscriptionId,
        metricName,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group by month
    const grouped: Record<string, number> = {};
    for (const usage of usages) {
      const monthKey = `${usage.timestamp.getFullYear()}-${String(usage.timestamp.getMonth() + 1).padStart(2, '0')}`;
      grouped[monthKey] = (grouped[monthKey] || 0) + Number(usage.quantity);
    }

    return Object.entries(grouped).map(([period, quantity]) => ({
      period,
      quantity,
    }));
  }

  static async checkLimit(subscriptionId: string, metricName: string, requestedQuantity: number) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: { include: { features: true } } },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    const metric = subscription.plan.features.find(
      (f) => f.name === metricName && f.isLimit
    );

    if (!metric || !metric.limitValue) {
      return { allowed: true, remaining: null, limit: null };
    }

    const currentUsage = await this.getCurrentPeriodUsage(
      subscription.customerId,
      subscriptionId,
      metricName
    );

    const remaining = metric.limitValue - currentUsage;
    const allowed = currentUsage + requestedQuantity <= metric.limitValue;

    return {
      allowed,
      remaining: Math.max(0, remaining),
      limit: metric.limitValue,
    };
  }
}