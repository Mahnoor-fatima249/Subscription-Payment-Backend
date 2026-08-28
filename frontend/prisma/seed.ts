import { PrismaClient, SubscriptionStatus, InvoiceStatus, PaymentStatus, CouponType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Seeding database with full demo data...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const customerPassword = await bcrypt.hash('customer123', 12);

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@billflow.com' },
    update: {},
    create: {
      email: 'admin@billflow.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
      customer: { create: { company: 'BillFlow Inc.', country: 'US', currency: 'usd' } },
    },
  });

  // Create plans
  const starterPlan = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: { basePrice: 29 },
    create: {
      name: 'Starter', slug: 'starter', description: 'Perfect for small teams',
      billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 29, currency: 'usd', isActive: true, sortOrder: 1,
      features: { create: [{ name: 'Projects', value: '5', isLimit: true, limitValue: 5 }, { name: 'Storage', value: '10GB', isLimit: true, limitValue: 10 }, { name: 'API Access', value: 'true' }] },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: { basePrice: 99 },
    create: {
      name: 'Pro', slug: 'pro', description: 'For growing businesses',
      billingModel: 'FLAT_RATE', billingInterval: 'MONTHLY', basePrice: 99, currency: 'usd', isActive: true, sortOrder: 2,
      features: { create: [{ name: 'Projects', value: 'Unlimited' }, { name: 'Storage', value: '100GB', isLimit: true, limitValue: 100 }, { name: 'API Access', value: 'true' }, { name: 'Priority Support', value: 'true' }] },
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: { basePrice: 299 },
    create: {
      name: 'Enterprise', slug: 'enterprise', description: 'For large organizations',
      billingModel: 'PER_SEAT', billingInterval: 'MONTHLY', basePrice: 299, currency: 'usd', isActive: true, sortOrder: 3,
      features: { create: [{ name: 'Projects', value: 'Unlimited' }, { name: 'Storage', value: '1TB', isLimit: true, limitValue: 1000 }, { name: 'API Access', value: 'true' }, { name: 'SLA', value: '99.9%' }] },
      tiers: { create: [{ upTo: 10, perUnitPrice: 299, flatFee: 0 }, { upTo: 50, perUnitPrice: 249, flatFee: 0 }, { upTo: 100, perUnitPrice: 199, flatFee: 0 }] },
    },
  });

  // Create coupons
  await prisma.coupon.upsert({ where: { code: 'WELCOME20' }, update: {}, create: { code: 'WELCOME20', description: '20% off first 3 months', couponType: 'PERCENTAGE', discountPercent: 20, maxRedemptions: 1000, redemptionCount: 47, isActive: true, validFrom: new Date('2026-01-01'), expiresAt: new Date('2027-01-01') } });
  await prisma.coupon.upsert({ where: { code: 'FREETRIAL' }, update: {}, create: { code: 'FREETRIAL', description: '30 days free trial', couponType: 'FREE_TRIAL', trialDays: 30, maxRedemptions: 500, redemptionCount: 123, isActive: true, validFrom: new Date('2026-01-01'), expiresAt: new Date('2027-01-01') } });
  await prisma.coupon.upsert({ where: { code: 'SAVE50' }, update: {}, create: { code: 'SAVE50', description: '$50 off first month', couponType: 'FIXED_AMOUNT', discountAmount: 50, maxRedemptions: 200, redemptionCount: 12, isActive: true, validFrom: new Date('2026-06-01'), expiresAt: new Date('2026-12-31') } });

  // Customers data
  const customersData = [
    { email: 'customer@example.com', first: 'John', last: 'Doe', company: 'Acme Corp', country: 'US' },
    { email: 'sarah@techstart.io', first: 'Sarah', last: 'Chen', company: 'TechStart', country: 'US' },
    { email: 'mike@globalretail.com', first: 'Mike', last: 'Johnson', company: 'Global Retail', country: 'UK' },
    { email: 'emma@designstudio.co', first: 'Emma', last: 'Wilson', company: 'Design Studio', country: 'CA' },
    { email: 'alex@fintech.dev', first: 'Alex', last: 'Turner', company: 'FinTech Dev', country: 'DE' },
    { email: 'lisa@healthplus.org', first: 'Lisa', last: 'Brown', company: 'HealthPlus', country: 'US' },
    { email: 'david@cloudnine.app', first: 'David', last: 'Martinez', company: 'CloudNine', country: 'AU' },
    { email: 'anna@smartlog.ru', first: 'Anna', last: 'Petrov', company: 'SmartLog', country: 'RU' },
    { email: 'james@nexgen.io', first: 'James', last: 'Anderson', company: 'NexGen', country: 'US' },
    { email: 'priya@dataflow.in', first: 'Priya', last: 'Sharma', company: 'DataFlow', country: 'IN' },
    { email: 'carlos@latamtech.mx', first: 'Carlos', last: 'Garcia', company: 'LatamTech', country: 'MX' },
    { email: 'sophie@eurosaas.fr', first: 'Sophie', last: 'Dubois', company: 'EuroSaaS', country: 'FR' },
    { email: 'omar@fintech-egypt.com', first: 'Omar', last: 'Hassan', company: 'FinTech Egypt', country: 'EG' },
    { email: 'yuki@japantech.jp', first: 'Yuki', last: 'Tanaka', company: 'JapanTech', country: 'JP' },
    { email: 'maria@brasildev.br', first: 'Maria', last: 'Silva', company: 'BrasilDev', country: 'BR' },
  ];

  const plans = [starterPlan, starterPlan, starterPlan, proPlan, proPlan, proPlan, proPlan, proPlan, enterprisePlan, enterprisePlan, starterPlan, proPlan, starterPlan, proPlan, enterprisePlan];
  const subStatuses: SubscriptionStatus[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'TRIALING', 'ACTIVE'];
  const paymentStatuses: PaymentStatus[] = ['SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'FAILED', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'REFUNDED', 'PENDING', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED'];

  const customerRecords = [];

  for (let i = 0; i < customersData.length; i++) {
    const c = customersData[i];
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash: i === 0 ? customerPassword : await bcrypt.hash('demo123', 12),
        firstName: c.first,
        lastName: c.last,
        role: 'CUSTOMER',
        isActive: true,
        customer: {
          create: { company: c.company, country: c.country, currency: 'usd' },
        },
      },
      include: { customer: true },
    });
    customerRecords.push({ user, plan: plans[i], status: subStatuses[i] });
  }
  console.log(`Created ${customersData.length} customers`);

  // Create subscriptions, invoices, payments
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < customerRecords.length; i++) {
    const { user, plan, status } = customerRecords[i];
    if (!user.customer) continue;

    const customerId = user.customer.id;
    const startDate = randomDate(oneYearAgo, sixMonthsAgo);

    const subscription = await prisma.subscription.create({
      data: {
        customerId,
        planId: plan.id,
        status,
        quantity: plan.billingModel === 'PER_SEAT' ? Math.floor(Math.random() * 20) + 1 : 1,
        currentPeriodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        createdAt: startDate,
      },
    });

    // Create 2-6 invoices per subscription
    const invoiceCount = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < invoiceCount; j++) {
      const invDate = new Date(startDate.getTime() + j * 30 * 24 * 60 * 60 * 1000);
      if (invDate > now) break;

      const planPrice = Number(plan.basePrice);
      const qty = subscription.quantity;
      const subtotal = planPrice * qty;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      const total = subtotal + tax;
      const invStatus = j === invoiceCount - 1 && status === 'PAST_DUE' ? 'OPEN' as InvoiceStatus : 'PAID' as InvoiceStatus;
      const amountPaid = invStatus === 'PAID' ? total : 0;

      const invoice = await prisma.invoice.create({
        data: {
          customerId,
          subscriptionId: subscription.id,
          invoiceNumber: `INV-${String(1000 + i * 10 + j).padStart(6, '0')}`,
          status: invStatus,
          subtotal,
          taxAmount: tax,
          total,
          amountPaid,
          amountDue: total - amountPaid,
          dueDate: new Date(invDate.getTime() + 15 * 24 * 60 * 60 * 1000),
          paidAt: invStatus === 'PAID' ? new Date(invDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
          periodStart: invDate,
          periodEnd: new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          attemptCount: invStatus === 'OPEN' ? Math.floor(Math.random() * 3) + 1 : 0,
          nextPaymentAttempt: invStatus === 'OPEN' ? new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
          createdAt: invDate,
        },
      });

      // Create payment for paid invoices
      if (invStatus === 'PAID') {
        await prisma.payment.create({
          data: {
            customerId,
            invoiceId: invoice.id,
            status: paymentStatuses[Math.min(i, paymentStatuses.length - 1)],
            amount: total,
            currency: 'usd',
            createdAt: new Date(invDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }
  console.log('Created subscriptions, invoices, and payments');

  console.log('\nSeeding completed!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@billflow.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
