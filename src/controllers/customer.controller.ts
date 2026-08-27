import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { CustomerService } from '../services/customer.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const createCustomerSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    company: z.string().optional(),
    taxId: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().length(2).default('US'),
    phone: z.string().optional(),
    currency: z.string().length(3).default('usd'),
  }),
});

export class CustomerController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.create(req.body);
      res.status(201).json(success(customer, 'Customer created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, search } = req.query;
      const { customers, total, page: currentPage, limit: currentLimit } = await CustomerService.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        search: search as string,
      });
      res.json(paginated(customers, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.findById(req.params.id);
      res.json(success(customer));
    } catch (error) {
      next(error);
    }
  }

  static async findByUserId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.findByUserId(req.params.userId);
      res.json(success(customer));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.update(req.params.id, req.body);
      res.json(success(customer, 'Customer updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async syncWithStripe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.syncWithStripe(req.params.id);
      res.json(success(customer, 'Customer synced with Stripe'));
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.findByUserId(req.user!.id);
      res.json(success(customer));
    } catch (error) {
      next(error);
    }
  }
}