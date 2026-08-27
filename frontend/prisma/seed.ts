import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
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
      customer: {
        create: {
          company: 'BillFlow Inc.',
          country: 'US',
          currency: 'usd',
        },
      },
    },
  });
  console.log('Admin user created:', admin.email);

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      isActive: true,
      customer: {
        create: {
          company: 'Acme Corp',
          country: 'US',
          currency: 'usd',
        },
      },
    },
  });
  console.log('Customer user created:', customerUser.email);

  // Create plans
  const starterPlan = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small teams and startups',
      billingModel: 'FLAT_RATE',
      billingInterval: 'MONTHLY',
      basePrice: 29,
      currency: 'usd',
      isActive: true,
      sortOrder: 1,
      features: {
        create: [
          { name: 'Projects', value: '5', isLimit: true, limitValue: 5 },
          { name: 'Storage', value: '10GB', isLimit: true, limitValue: 10 },
          { name: 'Team Members', value: '3', isLimit: true, limitValue: 3 },
          { name: 'API Access', value: 'false' },
          { name: 'Priority Support', value: 'false' },
        ],
      },
    },
  });
  console.log('Starter plan created:', starterPlan.name);

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses that need more',
      billingModel: 'FLAT_RATE',
      billingInterval: 'MONTHLY',
      basePrice: 99,
      currency: 'usd',
      isActive: true,
      sortOrder: 2,
      features: {
        create: [
          { name: 'Projects', value: 'Unlimited' },
          { name: 'Storage', value: '100GB', isLimit: true, limitValue: 100 },
          { name: 'Team Members', value: '10', isLimit: true, limitValue: 10 },
          { name: 'API Access', value: 'true' },
          { name: 'Priority Support', value: 'true' },
        ],
      },
    },
  });
  console.log('Pro plan created:', proPlan.name);

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations with custom needs',
      billingModel: 'PER_SEAT',
      billingInterval: 'MONTHLY',
      basePrice: 299,
      currency: 'usd',
      isActive: true,
      sortOrder: 3,
      features: {
        create: [
          { name: 'Projects', value: 'Unlimited' },
          { name: 'Storage', value: '1TB', isLimit: true, limitValue: 1000 },
          { name: 'Team Members', value: 'Unlimited' },
          { name: 'API Access', value: 'true' },
          { name: 'Priority Support', value: 'true' },
          { name: 'SLA', value: '99.9%' },
          { name: 'Custom Integrations', value: 'true' },
          { name: 'Dedicated Account Manager', value: 'true' },
        ],
      },
      tiers: {
        create: [
          { upTo: 10, perUnitPrice: 299, flatFee: 0, description: '1-10 seats' },
          { upTo: 50, perUnitPrice: 249, flatFee: 0, description: '11-50 seats' },
          { upTo: 100, perUnitPrice: 199, flatFee: 0, description: '51-100 seats' },
          { upTo: 999999, perUnitPrice: 149, flatFee: 0, description: '100+ seats' },
        ],
      },
    },
  });
  console.log('Enterprise plan created:', enterprisePlan.name);

  // Create coupons
  const welcomeCoupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      description: '20% off first 3 months',
      couponType: 'PERCENTAGE',
      discountPercent: 20,
      maxRedemptions: 1000,
      isActive: true,
      validFrom: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Welcome coupon created:', welcomeCoupon.code);

  const freeTrialCoupon = await prisma.coupon.upsert({
    where: { code: 'FREETRIAL' },
    update: {},
    create: {
      code: 'FREETRIAL',
      description: '30 days free trial',
      couponType: 'FREE_TRIAL',
      trialDays: 30,
      maxRedemptions: 500,
      isActive: true,
      validFrom: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('Free trial coupon created:', freeTrialCoupon.code);

  console.log('\nSeeding completed!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@billflow.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
