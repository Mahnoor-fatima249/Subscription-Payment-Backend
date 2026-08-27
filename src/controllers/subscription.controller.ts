import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SubscriptionService } from '../services/subscription.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    planId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
    trialDays: z.number().int().min(0).optional(),
    paymentMethodId: z.string().optional(),
    couponCode: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

const updateSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid().optional(),
    quantity: z.number().int().positive().optional(),
    cancelAt: z.string().datetime().optional(),
    cancelReason: z.enum(['CUSTOMER_REQUEST', 'PAYMENT_FAILED', 'TOO_EXPENSIVE', 'UNUSED', 'SWITCHED_TO_COMPETITOR', 'OTHER']).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export class SubscriptionController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.create(req.body);
      res.status(201).json(success(subscription, 'Subscription created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, search, status, customerId } = req.query;
      const { subscriptions, total, page: currentPage, limit: currentLimit } = await SubscriptionService.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        search: search as string,
        status: status as any,
        customerId: customerId as string,
      });
      res.json(paginated(subscriptions, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.findById(req.params.id);
      res.json(success(subscription));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.update(
        req.params.id,
        req.body,
        req.user?.id
      );
      res.json(success(subscription, 'Subscription updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason, immediately } = req.body;
      const subscription = await SubscriptionService.cancel(
        req.params.id,
        reason,
        immediately,
        req.user?.id
      );
      res.json(success(subscription, immediately ? 'Subscription cancelled' : 'Cancellation scheduled'));
    } catch (error) {
      next(error);
    }
  }

  static async pause(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.pause(req.params.id, req.user?.id);
      res.json(success(subscription, 'Subscription paused'));
    } catch (error) {
      next(error);
    }
  }

  static async resume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await SubscriptionService.resume(req.params.id, req.user?.id);
      res.json(success(subscription, 'Subscription resumed'));
    } catch (error) {
      next(error);
    }
  }

  static async getUpcomingInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await SubscriptionService.getUpcomingInvoice(req.params.id);
      res.json(success(invoice));
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const events = await SubscriptionService.getEvents(req.params.id);
      res.json(success(events));
    } catch (error) {
      next(error);
    }
  }

  static async getMySubscriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.id },
      });

      if (!customer) {
        return res.json(paginated([], 0, 1, 10));
      }

      const { subscriptions, total, page, limit } = await SubscriptionService.findAll({
        customerId: customer.id,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });
      res.json(paginated(subscriptions, total, page, limit));
    } catch (error) {
      next(error);
    }
  }
}

import prisma from '../utils/prisma';