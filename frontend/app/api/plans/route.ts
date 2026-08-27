import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        features: true,
        tiers: { orderBy: { upTo: 'asc' } },
        _count: { select: { subscriptions: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, billingModel, billingInterval, basePrice, currency, features, tiers } = body;

    const existing = await prisma.plan.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        slug,
        description,
        billingModel,
        billingInterval,
        basePrice,
        currency: currency || 'usd',
        features: features ? { create: features } : undefined,
        tiers: tiers ? { create: tiers } : undefined,
      },
      include: { features: true, tiers: true },
    });

    return NextResponse.json({
      success: true,
      data: plan,
      message: 'Plan created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
