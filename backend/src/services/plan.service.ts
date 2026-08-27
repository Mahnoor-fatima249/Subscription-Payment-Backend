import prisma from '../utils/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreatePlanInput, UpdatePlanInput, PaginationQuery } from '../types';

export class PlanService {
  static async create(data: CreatePlanInput) {
    const existingPlan = await prisma.plan.findUnique({
      where: { slug: data.slug },
    });

    if (existingPlan) {
      throw new ConflictError('Plan with this slug already exists');
    }

    return prisma.plan.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        billingModel: data.billingModel,
        billingInterval: data.billingInterval,
        basePrice: data.basePrice,
        currency: data.currency || 'usd',
        features: data.features
          ? {
              create: data.features,
            }
          : undefined,
        tiers: data.tiers
          ? {
              create: data.tiers,
            }
          : undefined,
      },
      include: {
        features: true,
        tiers: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  static async findAll(query: PaginationQuery) {
    const { page = 1, limit = 10, sortBy = 'sortOrder', sortOrder = 'asc', search } = query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          features: true,
          tiers: true,
          _count: {
            select: { subscriptions: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.plan.count({ where }),
    ]);

    return { plans, total, page, limit };
  }

  static async findById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        features: true,
        tiers: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundError('Plan');
    }

    return plan;
  }

  static async findBySlug(slug: string) {
    const plan = await prisma.plan.findUnique({
      where: { slug },
      include: {
        features: true,
        tiers: true,
      },
    });

    if (!plan) {
      throw new NotFoundError('Plan');
    }

    return plan;
  }

  static async update(id: string, data: UpdatePlanInput) {
    await this.findById(id);

    return prisma.plan.update({
      where: { id },
      data,
      include: {
        features: true,
        tiers: true,
      },
    });
  }

  static async delete(id: string) {
    await this.findById(id);

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: id,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictError(
        `Cannot delete plan with ${activeSubscriptions} active subscription(s)`
      );
    }

    return prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async addFeature(
    planId: string,
    data: {
      name: string;
      value: string;
      description?: string;
      isLimit?: boolean;
      limitValue?: number;
    }
  ) {
    await this.findById(planId);

    return prisma.planFeature.create({
      data: {
        planId,
        ...data,
      },
    });
  }

  static async updateFeature(featureId: string, data: Partial<{ value: string; limitValue: number }>) {
    return prisma.planFeature.update({
      where: { id: featureId },
      data,
    });
  }

  static async removeFeature(featureId: string) {
    return prisma.planFeature.delete({
      where: { id: featureId },
    });
  }

  static async addTier(
    planId: string,
    data: {
      upTo: number;
      perUnitPrice: number;
      flatFee?: number;
      description?: string;
    }
  ) {
    await this.findById(planId);

    return prisma.planTier.create({
      data: {
        planId,
        ...data,
      },
    });
  }

  static async updateTier(tierId: string, data: Partial<{ perUnitPrice: number; flatFee: number }>) {
    return prisma.planTier.update({
      where: { id: tierId },
      data,
    });
  }

  static async removeTier(tierId: string) {
    return prisma.planTier.delete({
      where: { id: tierId },
    });
  }
}
