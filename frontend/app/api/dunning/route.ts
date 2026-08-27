import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    
    const [failedPayments, metrics] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          status: { in: ['OPEN', 'UNCOLLECTIBLE'] },
          attemptCount: { gt: 0 },
        },
        include: {
          customer: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
        orderBy: { nextPaymentAttempt: 'asc' },
      }),
      prisma.invoice.aggregate({
        where: {
          status: { in: ['OPEN', 'UNCOLLECTIBLE'] },
          attemptCount: { gt: 0 },
        },
        _count: true,
        _sum: { amountDue: true },
      }),
    ]);

    const recovered = await prisma.payment.count({
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        status: 'SUCCEEDED',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        failedPayments,
        metrics: {
          totalFailed: metrics._count,
          totalAmount: metrics._sum.amountDue || 0,
          recoveredThisMonth: recovered,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
