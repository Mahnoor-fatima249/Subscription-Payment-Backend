import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      activeSubscriptions,
      totalCustomers,
      recentPayments,
      subscriptionsByStatus,
      revenueByPlan,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.customer.count(),
      prisma.payment.findMany({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.plan.findMany({
        select: {
          name: true,
          _count: { select: { subscriptions: { where: { status: 'ACTIVE' } } } },
        },
        where: { isActive: true },
      }),
    ]);

    const mrr = Number(totalRevenue._sum.amount || 0);
    const arr = mrr * 12;
    const arpu = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          mrr: Number(mrr),
          arr: Number(arr),
          arpu: Number(arpu.toFixed(2)),
          totalRevenue: Number(mrr),
        },
        customers: {
          total: totalCustomers,
          active: activeSubscriptions,
        },
        subscriptions: {
          byStatus: subscriptionsByStatus.map((s: { status: string; _count: number }) => ({
            status: s.status,
            count: s._count,
          })),
        },
        revenueByPlan: revenueByPlan.map((p: { name: string; _count: { subscriptions: number } }) => ({
          plan: p.name,
          subscribers: p._count.subscriptions,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
