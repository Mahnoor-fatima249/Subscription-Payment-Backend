import prisma from '../utils/prisma';
import { RevenueMetrics } from '../types';

export class ReportingService {
  static async getRevenueMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<RevenueMetrics> {
    const [
      subscriptionCounts,
      revenueData,
      churnData,
    ] = await Promise.all([
      this.getSubscriptionCounts(startDate, endDate),
      this.getRevenueData(startDate, endDate),
      this.getChurnData(startDate, endDate),
    ]);

    const { active, trialing, cancelled } = subscriptionCounts;

    const totalRevenue = revenueData.reduce((sum: number, r: { revenue: number }) => sum + r.revenue, 0);
    const mrr = await this.calculateMRR();
    const arr = mrr * 12;
    const averageRevenuePerUser = active > 0 ? totalRevenue / active : 0;
    const lifetimeValue = await this.calculateLTV();

    return {
      mrr,
      arr,
      totalRevenue,
      averageRevenuePerUser,
      churnRate: churnData.churnRate,
      lifetimeValue,
      activeSubscriptions: active,
      trialSubscriptions: trialing,
      cancelledSubscriptions: cancelled,
      revenueByPlan: revenueData,
      revenueByPeriod: await this.getRevenueByPeriod(startDate, endDate),
    };
  }

  private static async getSubscriptionCounts(startDate: Date, endDate: Date) {
    const [active, trialing, cancelled] = await Promise.all([
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.subscription.count({
        where: {
          status: 'TRIALING',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.subscription.count({
        where: {
          status: 'CANCELLED',
          canceledAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return { active, trialing, cancelled };
  }

  private static async getRevenueData(startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate },
      },
      include: {
        subscription: { include: { plan: true } },
      },
    });

    const planRevenue: Record<string, { revenue: number; subscribers: Set<string> }> = {};

    for (const invoice of invoices) {
      const planId = invoice.subscription?.planId || 'unknown';
      const planName = invoice.subscription?.plan?.name || 'Unknown';

      if (!planRevenue[planId]) {
        planRevenue[planId] = { revenue: 0, subscribers: new Set() };
      }

      planRevenue[planId].revenue += Number(invoice.amountPaid);
      if (invoice.subscription?.customerId) {
        planRevenue[planId].subscribers.add(invoice.subscription.customerId);
      }
    }

    return Object.entries(planRevenue).map(([planId, data]) => ({
      planId,
      planName: data.subscribers.size > 0 ? 'Plan' : 'Unknown', // Will be fixed below
      revenue: data.revenue,
      subscribers: data.subscribers.size,
    }));
  }

  private static async getChurnData(startDate: Date, endDate: Date) {
    const startOfPeriod = new Date(startDate);
    const endOfPeriod = new Date(endDate);

    const [startActive, cancelled] = await Promise.all([
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lte: startOfPeriod },
        },
      }),
      prisma.subscription.count({
        where: {
          status: 'CANCELLED',
          canceledAt: { gte: startOfPeriod, lte: endOfPeriod },
        },
      }),
    ]);

    const churnRate = startActive > 0 ? (cancelled / startActive) * 100 : 0;

    return { churnRate, startActive, cancelled };
  }

  private static async calculateMRR(): Promise<number> {
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: true, discounts: { where: { isActive: true } } },
    });

    let mrr = 0;

    for (const sub of activeSubscriptions) {
      let monthlyPrice = Number(sub.plan.basePrice);

      // Apply discounts
      for (const discount of sub.discounts) {
        monthlyPrice -= Number(discount.amount);
      }

      // Convert to monthly based on billing interval
      const intervalMultiplier: Record<string, number> = {
        DAILY: 30,
        WEEKLY: 4.33,
        MONTHLY: 1,
        QUARTERLY: 1 / 3,
        YEARLY: 1 / 12,
      };

      monthlyPrice *= intervalMultiplier[sub.plan.billingInterval] || 1;
      monthlyPrice *= sub.quantity;

      mrr += Math.max(0, monthlyPrice);
    }

    return mrr;
  }

  private static async calculateLTV(): Promise<number> {
    // Simplified LTV calculation: ARPU / Churn Rate
    // This would be more sophisticated in production
    return 0; // Placeholder
  }

  private static async getRevenueByPeriod(startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate },
      },
      select: { amountPaid: true, paidAt: true },
    });

    const periodMap: Record<string, number> = {};

    for (const invoice of invoices) {
      if (!invoice.paidAt) continue;
      const periodKey = `${invoice.paidAt.getFullYear()}-${String(invoice.paidAt.getMonth() + 1).padStart(2, '0')}`;
      periodMap[periodKey] = (periodMap[periodKey] || 0) + Number(invoice.amountPaid);
    }

    return Object.entries(periodMap)
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  static async getSubscriptionMetrics() {
    const [
      totalSubscriptions,
      byStatus,
      byPlan,
      byInterval,
      recentChanges,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.subscription.groupBy({
        by: ['planId'],
        _count: true,
        orderBy: { _count: { planId: 'desc' } },
        take: 10,
      }),
      prisma.subscription.groupBy({
        by: ['planId'],
        _sum: { quantity: true },
      }),
      prisma.subscriptionEvent.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { subscription: { include: { plan: true } } },
      }),
    ]);

    const planDetails = await prisma.plan.findMany({
      where: { id: { in: byPlan.map(p => p.planId) } },
      select: { id: true, name: true },
    });

    const planMap = new Map(planDetails.map(p => [p.id, p.name]));

    return {
      total: totalSubscriptions,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      byPlan: byPlan.map(p => ({
        planId: p.planId,
        planName: planMap.get(p.planId) || 'Unknown',
        count: p._count,
      })),
      recentChanges: recentChanges.map(e => ({
        type: e.eventType,
        subscriptionId: e.subscriptionId,
        planName: e.subscription?.plan?.name,
        previousStatus: e.previousStatus,
        newStatus: e.newStatus,
        createdAt: e.createdAt,
      })),
    };
  }

  static async getCustomerMetrics() {
    const [totalCustomers, newCustomers, activeCustomers, churnedCustomers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.customer.count({
        where: {
          subscriptions: {
            some: { status: { in: ['ACTIVE', 'TRIALING'] } },
          },
        },
      }),
      prisma.customer.count({
        where: {
          subscriptions: {
            every: { status: { in: ['CANCELLED', 'EXPIRED'] } },
          },
        },
      }),
    ]);

    return {
      total: totalCustomers,
      newThisMonth: newCustomers,
      active: activeCustomers,
      churned: churnedCustomers,
      activeRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
    };
  }

  static async getPlanPerformance() {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { subscriptions: true } },
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIALING'] } },
          include: { discounts: { where: { isActive: true } } },
        },
      },
    });

    return plans.map(plan => {
      const activeSubs = plan.subscriptions.length;
      let mrr = 0;

      for (const sub of plan.subscriptions) {
        let monthlyPrice = Number(plan.basePrice);

        for (const discount of sub.discounts) {
          monthlyPrice -= Number(discount.amount);
        }

        const intervalMultiplier: Record<string, number> = {
          DAILY: 30,
          WEEKLY: 4.33,
          MONTHLY: 1,
          QUARTERLY: 1 / 3,
          YEARLY: 1 / 12,
        };

        monthlyPrice *= intervalMultiplier[plan.billingInterval] || 1;
        monthlyPrice *= sub.quantity;
        mrr += Math.max(0, monthlyPrice);
      }

      return {
        planId: plan.id,
        planName: plan.name,
        billingModel: plan.billingModel,
        billingInterval: plan.billingInterval,
        basePrice: Number(plan.basePrice),
        activeSubscriptions: activeSubs,
        mrr,
        totalSubscriptions: plan._count.subscriptions,
      };
    });
  }

  static async getUsageReport(startDate: Date, endDate: Date) {
    const usages = await prisma.usage.findMany({
      where: { timestamp: { gte: startDate, lte: endDate } },
      include: { subscription: { include: { plan: true } } },
    });

    const metricMap: Record<string, { total: number; byPlan: Record<string, number> }> = {};

    for (const usage of usages) {
      if (!metricMap[usage.metricName]) {
        metricMap[usage.metricName] = { total: 0, byPlan: {} };
      }
      metricMap[usage.metricName].total += Number(usage.quantity);
      const planName = usage.subscription.plan.name;
      metricMap[usage.metricName].byPlan[planName] =
        (metricMap[usage.metricName].byPlan[planName] || 0) + Number(usage.quantity);
    }

    return Object.entries(metricMap).map(([metricName, data]) => ({
      metricName,
      totalUsage: data.total,
      byPlan: Object.entries(data.byPlan).map(([planName, usage]) => ({ planName, usage })),
    }));
  }
}