import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const event = await prisma.webhookEvent.create({
      data: {
        externalId: body.id || `evt_${Date.now()}`,
        source: 'STRIPE',
        eventType: body.type,
        payload: body,
        status: 'processed',
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
