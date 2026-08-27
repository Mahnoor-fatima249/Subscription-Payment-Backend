import { PlanService } from '../services/plan.service';
import prisma from '../utils/prisma';
import { BillingModel, BillingInterval } from '@prisma/client';

describe('PlanService', () => {
  const testPlan = {
    name: 'Test Plan',
    slug: 'test-plan',
    description: 'Test plan for unit tests',
    billingModel: BillingModel.FLAT_RATE,
    billingInterval: BillingInterval.MONTHLY,
    basePrice: 19.99,
    currency: 'usd',
  };

  afterAll(async () => {
    await prisma.plan.deleteMany({ where: { slug: testPlan.slug } });
  });

  it('should create a plan', async () => {
    const plan = await PlanService.create(testPlan);

    expect(plan).toHaveProperty('id');
    expect(plan.name).toBe(testPlan.name);
    expect(plan.slug).toBe(testPlan.slug);
    expect(plan.basePrice).toBe(testPlan.basePrice);
  });

  it('should not create duplicate slug', async () => {
    await expect(PlanService.create(testPlan)).rejects.toThrow('already exists');
  });

  it('should find all plans', async () => {
    const { plans, total } = await PlanService.findAll({ page: 1, limit: 10 });

    expect(Array.isArray(plans)).toBe(true);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  it('should find plan by id', async () => {
    const created = await PlanService.create({ ...testPlan, slug: 'test-plan-2' });
    const plan = await PlanService.findById(created.id);

    expect(plan.id).toBe(created.id);
    expect(plan.name).toBe(testPlan.name);
  });

  it('should find plan by slug', async () => {
    const plan = await PlanService.findBySlug(testPlan.slug);

    expect(plan.slug).toBe(testPlan.slug);
  });

  it('should update plan', async () => {
    const created = await PlanService.create({ ...testPlan, slug: 'test-plan-3' });
    const updated = await PlanService.update(created.id, { name: 'Updated Plan', basePrice: 29.99 });

    expect(updated.name).toBe('Updated Plan');
    expect(updated.basePrice).toBe(29.99);
  });

  it('should add feature to plan', async () => {
    const created = await PlanService.create({ ...testPlan, slug: 'test-plan-4' });
    const feature = await PlanService.addFeature(created.id, {
      name: 'test_feature',
      value: 'test_value',
      description: 'Test feature',
    });

    expect(feature.name).toBe('test_feature');
    expect(feature.value).toBe('test_value');
  });

  it('should add tier to plan', async () => {
    const created = await PlanService.create({
      ...testPlan,
      slug: 'test-plan-5',
      billingModel: BillingModel.TIERED,
    });
    const tier = await PlanService.addTier(created.id, {
      upTo: 10,
      perUnitPrice: 5.00,
      flatFee: 10.00,
    });

    expect(tier.upTo).toBe(10);
    expect(tier.perUnitPrice).toBe(5.00);
  });

  it('should delete plan', async () => {
    const created = await PlanService.create({ ...testPlan, slug: 'test-plan-6' });
    await PlanService.delete(created.id);

    await expect(PlanService.findById(created.id)).rejects.toThrow('not found');
  });
});