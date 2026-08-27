import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true, paymentMethods: true } },
        plan: { include: { features: true, tiers: true } },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
        events: { orderBy: { createdAt: 'desc' }, take: 10 },
        discounts: { where: { isActive: true }, include: { coupon: true } },
      },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const subscription = await prisma.subscription.update({
      where: { id },
      data: body,
      include: { customer: true, plan: true },
    });

    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: id,
        eventType: 'UPDATED',
        newStatus: subscription.status,
        metadata: body,
      },
    });

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
