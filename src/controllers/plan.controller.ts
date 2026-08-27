import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { PlanService } from '../services/plan.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    billingModel: z.enum(['FLAT_RATE', 'PER_SEAT', 'USAGE_BASED', 'TIERED', 'HYBRID']),
    billingInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
    basePrice: z.number().positive(),
    currency: z.string().length(3).default('usd'),
    features: z.array(z.object({
      name: z.string(),
      value: z.string(),
      description: z.string().optional(),
      isLimit: z.boolean().default(false),
      limitValue: z.number().int().positive().optional(),
    })).optional(),
    tiers: z.array(z.object({
      upTo: z.number().int().positive(),
      perUnitPrice: z.number().positive(),
      flatFee: z.number().min(0).default(0),
      description: z.string().optional(),
    })).optional(),
  }),
});

const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    basePrice: z.number().positive().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export class PlanController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.create(req.body);
      res.status(201).json(success(plan, 'Plan created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, search } = req.query;
      const { plans, total, page: currentPage, limit: currentLimit } = await PlanService.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        search: search as string,
      });
      res.json(paginated(plans, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.findById(req.params.id);
      res.json(success(plan));
    } catch (error) {
      next(error);
    }
  }

  static async findBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.findBySlug(req.params.slug);
      res.json(success(plan));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.update(req.params.id, req.body);
      res.json(success(plan, 'Plan updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await PlanService.delete(req.params.id);
      res.json(success(null, 'Plan deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async addFeature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const feature = await PlanService.addFeature(req.params.id, req.body);
      res.status(201).json(success(feature, 'Feature added successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateFeature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const feature = await PlanService.updateFeature(req.params.featureId, req.body);
      res.json(success(feature, 'Feature updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async removeFeature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await PlanService.removeFeature(req.params.featureId);
      res.json(success(null, 'Feature removed successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async addTier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tier = await PlanService.addTier(req.params.id, req.body);
      res.status(201).json(success(tier, 'Tier added successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateTier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tier = await PlanService.updateTier(req.params.tierId, req.body);
      res.json(success(tier, 'Tier updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async removeTier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await PlanService.removeTier(req.params.tierId);
      res.json(success(null, 'Tier removed successfully'));
    } catch (error) {
      next(error);
    }
  }
}