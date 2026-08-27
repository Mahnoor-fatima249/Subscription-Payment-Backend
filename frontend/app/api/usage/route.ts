import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, subscriptionId, metricName, quantity } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, message: 'Subscription is not active' }, { status: 400 });
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usage = await prisma.usage.create({
      data: {
        customerId,
        subscriptionId,
        metricName,
        quantity,
        periodStart,
        periodEnd,
      },
    });

    return NextResponse.json({
      success: true,
      data: usage,
      message: 'Usage recorded successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const subscriptionId = searchParams.get('subscriptionId');
    const metricName = searchParams.get('metricName');

    const where: Record<string, string> = {};
    if (customerId) where.customerId = customerId;
    if (subscriptionId) where.subscriptionId = subscriptionId;
    if (metricName) where.metricName = metricName;

    const usage = await prisma.usage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
