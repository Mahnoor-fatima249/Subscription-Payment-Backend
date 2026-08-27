import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { CouponService } from '../services/coupon.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/),
    description: z.string().optional(),
    couponType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL', 'TRIAL_EXTENSION']),
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().positive().optional(),
    trialDays: z.number().int().positive().optional(),
    maxRedemptions: z.number().int().positive().optional(),
    planId: z.string().uuid().optional(),
    validFrom: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
  }),
});

const applyCouponSchema = z.object({
  body: z.object({
    subscriptionId: z.string().uuid(),
    couponCode: z.string(),
  }),
});

export class CouponController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await CouponService.create(req.body);
      res.status(201).json(success(coupon, 'Coupon created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, search, isActive } = req.query;
      const { coupons, total, page: currentPage, limit: currentLimit } = await CouponService.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        search: search as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json(paginated(coupons, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await CouponService.findById(req.params.id);
      res.json(success(coupon));
    } catch (error) {
      next(error);
    }
  }

  static async findByCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await CouponService.findByCode(req.params.code);
      res.json(success(coupon));
    } catch (error) {
      next(error);
    }
  }

  static async validate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { planId } = req.query;
      const coupon = await CouponService.validate(req.params.code, planId as string);
      res.json(success(coupon, 'Coupon is valid'));
    } catch (error) {
      next(error);
    }
  }

  static async applyToSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discount = await CouponService.applyToSubscription(req.body);
      res.json(success(discount, 'Coupon applied successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async removeFromSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CouponService.removeFromSubscription(req.params.subscriptionId, req.params.couponId);
      res.json(success(null, 'Coupon removed from subscription'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await CouponService.update(req.params.id, req.body);
      res.json(success(coupon, 'Coupon updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CouponService.delete(req.params.id);
      res.json(success(null, 'Coupon deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getActiveForPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await CouponService.getActiveCouponsForPlan(req.params.planId);
      res.json(success(coupons));
    } catch (error) {
      next(error);
    }
  }
}