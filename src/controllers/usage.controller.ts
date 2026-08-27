import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { UsageService } from '../services/usage.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const recordUsageSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    subscriptionId: z.string().uuid(),
    metricName: z.string().min(1),
    quantity: z.number().positive(),
    timestamp: z.string().datetime().optional(),
  }),
});

const batchUsageSchema = z.object({
  body: z.array(z.object({
    customerId: z.string().uuid(),
    subscriptionId: z.string().uuid(),
    metricName: z.string().min(1),
    quantity: z.number().positive(),
    timestamp: z.string().datetime().optional(),
  })).min(1),
});

export class UsageController {
  static async record(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const usage = await UsageService.record(req.body);
      res.status(201).json(success(usage, 'Usage recorded'));
    } catch (error) {
      next(error);
    }
  }

  static async recordBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const usages = await UsageService.recordBatch(req.body);
      res.status(201).json(success(usages, 'Usage batch recorded'));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, sortBy, sortOrder, customerId, subscriptionId, metricName, periodStart, periodEnd } = req.query;
      const { usages, total, page: currentPage, limit: currentLimit } = await UsageService.getUsage({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        customerId: customerId as string,
        subscriptionId: subscriptionId as string,
        metricName: metricName as string,
        periodStart: periodStart ? new Date(periodStart as string) : undefined,
        periodEnd: periodEnd ? new Date(periodEnd as string) : undefined,
      });
      res.json(paginated(usages, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subscriptionId, metricName } = req.query;
      const periodStart = new Date();
      periodStart.setMonth(periodStart.getMonth() - 1);
      const periodEnd = new Date();

      const summary = await UsageService.getUsageSummary(
        req.user!.id,
        subscriptionId as string,
        periodStart,
        periodEnd
      );
      res.json(success(summary));
    } catch (error) {
      next(error);
    }
  }

  static async getByPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subscriptionId, metricName, months } = req.query;
      const data = await UsageService.getUsageByPeriod(
        subscriptionId as string,
        metricName as string,
        Number(months) || 12
      );
      res.json(success(data));
    } catch (error) {
      next(error);
    }
  }

  static async checkLimit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subscriptionId, metricName, quantity } = req.query;
      const result = await UsageService.checkLimit(
        subscriptionId as string,
        metricName as string,
        Number(quantity) || 1
      );
      res.json(success(result));
    } catch (error) {
      next(error);
    }
  }
}