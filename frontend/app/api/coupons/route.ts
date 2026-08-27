import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        plan: true,
        _count: { select: { discounts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, description, couponType, discountPercent, discountAmount, trialDays, maxRedemptions, planId, validFrom, expiresAt } = body;

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        couponType,
        discountPercent,
        discountAmount,
        trialDays,
        maxRedemptions,
        planId,
        validFrom: new Date(validFrom),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: { plan: true },
    });

    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
