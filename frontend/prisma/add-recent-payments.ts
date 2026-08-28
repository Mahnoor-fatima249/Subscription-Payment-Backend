import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding recent payments for last 30 days...');

  const now = new Date();
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true, customer: true },
  });

  for (let i = 0; i < activeSubscriptions.length; i++) {
    const sub = activeSubscriptions[i];
    const planPrice = Number(sub.plan.basePrice) * sub.quantity;

    // Create 1-3 recent payments per active subscription
    const paymentCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < paymentCount; j++) {
      const daysAgo = Math.floor(Math.random() * 25) + 1;
      const paymentDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Create invoice
      const invNum = `INV-${String(2000 + i * 10 + j).padStart(6, '0')}`;
      const tax = Math.round(planPrice * 0.08 * 100) / 100;
      const total = planPrice + tax;

      const invoice = await prisma.invoice.create({
        data: {
          customerId: sub.customerId,
          subscriptionId: sub.id,
          invoiceNumber: invNum,
          status: 'PAID',
          subtotal: planPrice,
          taxAmount: tax,
          total,
          amountPaid: total,
          amountDue: 0,
          dueDate: new Date(paymentDate.getTime() + 15 * 24 * 60 * 60 * 1000),
          paidAt: paymentDate,
          periodStart: paymentDate,
          periodEnd: new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          createdAt: paymentDate,
        },
      });

      await prisma.payment.create({
        data: {
          customerId: sub.customerId,
          invoiceId: invoice.id,
          status: 'SUCCEEDED',
          amount: total,
          currency: 'usd',
          createdAt: paymentDate,
        },
      });
    }
  }

  console.log(`Added recent payments for ${activeSubscriptions.length} active subscriptions`);
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
