import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true, paymentMethods: true } },
        subscription: { include: { plan: true } },
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json();

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    let newStatus: string;
    switch (action) {
      case 'finalize':
        if (invoice.status !== 'DRAFT') {
          return NextResponse.json({ success: false, message: 'Only draft invoices can be finalized' }, { status: 400 });
        }
        newStatus = 'OPEN';
        break;
      case 'pay':
        if (invoice.status !== 'OPEN') {
          return NextResponse.json({ success: false, message: 'Only open invoices can be paid' }, { status: 400 });
        }
        newStatus = 'PAID';
        break;
      case 'void':
        if (invoice.status === 'PAID') {
          return NextResponse.json({ success: false, message: 'Paid invoices cannot be voided' }, { status: 400 });
        }
        newStatus = 'VOID';
        break;
      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: newStatus as never,
        ...(newStatus === 'PAID' ? { paidAt: new Date(), amountPaid: invoice.total, amountDue: 0 } : {}),
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Invoice ${action}d successfully`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
