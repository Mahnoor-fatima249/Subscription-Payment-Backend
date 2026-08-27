import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        features: true,
        tiers: { orderBy: { upTo: 'asc' } },
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) {
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: plan,
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

    const plan = await prisma.plan.update({
      where: { id },
      data: body,
      include: { features: true, tiers: true },
    });

    return NextResponse.json({
      success: true,
      data: plan,
      message: 'Plan updated successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: id,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete plan with active subscriptions',
      }, { status: 400 });
    }

    await prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deactivated successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
