import { PrismaClient, CouponType } from '@prisma/client';
import prisma from '../utils/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { CreateCouponInput, PaginationQuery } from '../types';

export class CouponService {
  static async create(data: CreateCouponInput) {
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new ConflictError('Coupon code already exists');
    }

    // Validate coupon type requirements
    if (data.couponType === CouponType.PERCENTAGE && !data.discountPercent) {
      throw new BadRequestError('discountPercent is required for percentage coupons');
    }

    if (data.couponType === CouponType.FIXED_AMOUNT && !data.discountAmount) {
      throw new BadRequestError('discountAmount is required for fixed amount coupons');
    }

    if (data.couponType === CouponType.FREE_TRIAL && !data.trialDays) {
      throw new BadRequestError('trialDays is required for free trial coupons');
    }

    if (data.couponType === CouponType.TRIAL_EXTENSION && !data.trialDays) {
      throw new BadRequestError('trialDays is required for trial extension coupons');
    }

    if (data.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
      if (!plan) {
        throw new NotFoundError('Plan');
      }
    }

    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        couponType: data.couponType,
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        trialDays: data.trialDays,
        maxRedemptions: data.maxRedemptions,
        planId: data.planId,
        validFrom: data.validFrom,
        expiresAt: data.expiresAt,
      },
    });
  }

  static async findAll(query: PaginationQuery & { isActive?: boolean }) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          plan: { select: { id: true, name: true } },
          _count: { select: { discounts: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.coupon.count({ where }),
    ]);

    return { coupons, total, page, limit };
  }

  static async findById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        plan: { select: { id: true, name: true } },
        discounts: {
          include: { subscription: { include: { customer: true } } },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon');
    }

    return coupon;
  }

  static async findByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { plan: true },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon');
    }

    return coupon;
  }

  static async validate(code: string, planId?: string) {
    const coupon = await this.findByCode(code);

    if (!coupon.isActive) {
      throw new BadRequestError('Coupon is not active');
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw new BadRequestError('Coupon is not yet valid');
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestError('Coupon has expired');
    }

    if (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions) {
      throw new BadRequestError('Coupon has reached maximum redemptions');
    }

    if (coupon.planId && coupon.planId !== planId) {
      throw new BadRequestError('Coupon is not valid for this plan');
    }

    return coupon;
  }

  static async applyToSubscription(data: { subscriptionId: string; couponCode: string }) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    const coupon = await this.validate(data.couponCode, subscription.planId);

    // Check if subscription already has an active discount for this coupon
    const existingDiscount = await prisma.subscriptionDiscount.findFirst({
      where: {
        subscriptionId: data.subscriptionId,
        couponId: coupon.id,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    });

    if (existingDiscount) {
      throw new BadRequestError('Coupon already applied to this subscription');
    }

    let discountAmount = 0;
    let endDate: Date | null = null;

    switch (coupon.couponType) {
      case CouponType.PERCENTAGE:
        discountAmount = (Number(subscription.plan.basePrice) * Number(coupon.discountPercent!)) / 100;
        break;
      case CouponType.FIXED_AMOUNT:
        discountAmount = Number(coupon.discountAmount!);
        break;
      case CouponType.FREE_TRIAL:
      case CouponType.TRIAL_EXTENSION:
        discountAmount = Number(subscription.plan.basePrice);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + (coupon.trialDays || 0));
        break;
    }

    const discount = await prisma.subscriptionDiscount.create({
      data: {
        subscriptionId: data.subscriptionId,
        couponId: coupon.id,
        amount: discountAmount,
        startDate: new Date(),
        endDate,
      },
      include: { coupon: true },
    });

    // Update coupon redemption count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { redemptionCount: { increment: 1 } },
    });

    // Update subscription in Stripe if applicable
    if (subscription.stripeSubscriptionId && coupon.couponType !== CouponType.FREE_TRIAL) {
      // Stripe coupon application would go here
    }

    return discount;
  }

  static async removeFromSubscription(subscriptionId: string, couponId: string) {
    const discount = await prisma.subscriptionDiscount.findFirst({
      where: {
        subscriptionId,
        couponId,
        isActive: true,
      },
    });

    if (!discount) {
      throw new NotFoundError('Active discount');
    }

    return prisma.subscriptionDiscount.update({
      where: { id: discount.id },
      data: { isActive: false },
    });
  }

  static async update(id: string, data: Partial<CreateCouponInput>) {
    await this.findById(id);

    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        code: data.code?.toUpperCase(),
      },
    });
  }

  static async delete(id: string) {
    await this.findById(id);

    // Check if coupon has active discounts
    const activeDiscounts = await prisma.subscriptionDiscount.count({
      where: { couponId: id, isActive: true },
    });

    if (activeDiscounts > 0) {
      throw new ConflictError(`Cannot delete coupon with ${activeDiscounts} active discounts`);
    }

    return prisma.coupon.delete({ where: { id } });
  }

  static async getActiveCouponsForPlan(planId: string) {
    const now = new Date();
    return prisma.coupon.findMany({
      where: {
        OR: [
          { planId },
          { planId: null }, // Global coupons
        ],
        isActive: true,
        validFrom: { lte: now },
        AND: [
          { OR: [
            { expiresAt: null },
            { expiresAt: { gte: now } },
          ]},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}