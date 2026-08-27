import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up test data
  const models = [
    'usage',
    'invoiceItem',
    'payment',
    'invoice',
    'subscriptionDiscount',
    'subscriptionEvent',
    'subscription',
    'planTier',
    'planFeature',
    'plan',
    'paymentMethod',
    'customer',
    'coupon',
    'webhookEvent',
    'auditLog',
    'notification',
    'user',
  ];

  for (const model of models) {
    try {
      await (prisma as any)[model].deleteMany({
        where: {
          OR: [
            { email: { contains: 'test' } },
            { name: { contains: 'Test' } },
            { code: { contains: 'TEST' } },
          ],
        },
      });
    } catch {
      // Ignore errors for models that don't have these fields
    }
  }
});

// @ts-ignore - global prisma for tests
(global as any).prisma = prisma;

jest.setTimeout(30000);