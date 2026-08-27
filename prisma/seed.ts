import { PrismaClient, BillingModel, BillingInterval, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@billing.com' },
    update: {},
    create: {
      email: 'admin@billing.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Create test customer user
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    },
  });

  // Create customer profile
  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      company: 'Test Company',
      addressLine1: '123 Test St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'US',
      phone: '+1-555-0123',
    },
  });

  // Create plans
  const basicPlan = await prisma.plan.upsert({
    where: { slug: 'basic' },
    update: {},
    create: {
      name: 'Basic',
      slug: 'basic',
      description: 'Perfect for individuals and small projects',
      billingModel: BillingModel.FLAT_RATE,
      billingInterval: BillingInterval.MONTHLY,
      basePrice: 9.99,
      currency: 'usd',
      sortOrder: 1,
      features: {
        create: [
          { name: 'projects', value: '5', description: 'Number of projects', isLimit: true, limitValue: 5 },
          { name: 'team_members', value: '1', description: 'Team members', isLimit: true, limitValue: 1 },
          { name: 'storage_gb', value: '10', description: 'Storage in GB', isLimit: true, limitValue: 10 },
          { name: 'api_calls', value: '10000', description: 'API calls per month', isLimit: true, limitValue: 10000 },
        ],
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing teams and businesses',
      billingModel: BillingModel.PER_SEAT,
      billingInterval: BillingInterval.MONTHLY,
      basePrice: 29.99,
      currency: 'usd',
      sortOrder: 2,
      features: {
        create: [
          { name: 'projects', value: 'unlimited', description: 'Unlimited projects' },
          { name: 'team_members', value: '10', description: 'Up to 10 team members', isLimit: true, limitValue: 10 },
          { name: 'storage_gb', value: '100', description: 'Storage in GB', isLimit: true, limitValue: 100 },
          { name: 'api_calls', value: '100000', description: 'API calls per month', isLimit: true, limitValue: 100000 },
          { name: 'priority_support', value: 'true', description: 'Priority support' },
        ],
      },
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations with custom needs',
      billingModel: BillingModel.TIERED,
      billingInterval: BillingInterval.MONTHLY,
      basePrice: 99.99,
      currency: 'usd',
      sortOrder: 3,
      features: {
        create: [
          { name: 'projects', value: 'unlimited', description: 'Unlimited projects' },
          { name: 'team_members', value: 'unlimited', description: 'Unlimited team members' },
          { name: 'storage_gb', value: '1000', description: 'Storage in GB', isLimit: true, limitValue: 1000 },
          { name: 'api_calls', value: '1000000', description: 'API calls per month', isLimit: true, limitValue: 1000000 },
          { name: 'dedicated_support', value: 'true', description: 'Dedicated support' },
          { name: 'sla', value: '99.9%', description: '99.9% uptime SLA' },
        ],
      },
      tiers: {
        create: [
          { upTo: 10, perUnitPrice: 99.99, flatFee: 0, description: '1-10 users' },
          { upTo: 50, perUnitPrice: 79.99, flatFee: 0, description: '11-50 users' },
          { upTo: 100, perUnitPrice: 59.99, flatFee: 0, description: '51-100 users' },
          { upTo: 1000, perUnitPrice: 39.99, flatFee: 0, description: '100+ users' },
        ],
      },
    },
  });

  const usagePlan = await prisma.plan.upsert({
    where: { slug: 'pay-as-you-go' },
    update: {},
    create: {
      name: 'Pay As You Go',
      slug: 'pay-as-you-go',
      description: 'Only pay for what you use',
      billingModel: BillingModel.USAGE_BASED,
      billingInterval: BillingInterval.MONTHLY,
      basePrice: 0.10,
      currency: 'usd',
      sortOrder: 4,
      features: {
        create: [
          { name: 'api_calls', value: '0.001', description: 'Per API call', isLimit: false },
          { name: 'storage_gb', value: '0.50', description: 'Per GB stored', isLimit: false },
          { name: 'bandwidth_gb', value: '0.10', description: 'Per GB transferred', isLimit: false },
        ],
      },
    },
  });

  // Create coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      description: '20% off first month',
      couponType: 'PERCENTAGE',
      discountPercent: 20,
      maxRedemptions: 100,
      validFrom: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50',
      description: '$50 off annual plan',
      couponType: 'FIXED_AMOUNT',
      discountAmount: 50,
      maxRedemptions: 50,
      validFrom: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'TRIAL30' },
    update: {},
    create: {
      code: 'TRIAL30',
      description: '30 days free trial',
      couponType: 'FREE_TRIAL',
      trialDays: 30,
      maxRedemptions: 200,
      validFrom: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`
  📧 Admin: admin@billing.com / admin123
  📧 Customer: customer@test.com / customer123
  📦 Plans: Basic, Pro, Enterprise, Pay As You Go
  🎟️ Coupons: WELCOME20, SAVE50, TRIAL30
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });