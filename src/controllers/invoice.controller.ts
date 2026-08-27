import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { InvoiceService } from '../services/invoice.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    subscriptionId: z.string().uuid().optional(),
    items: z.array(z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive().default(1),
      unitPrice: z.number().positive(),
      periodStart: z.string().datetime().optional(),
      periodEnd: z.string().datetime().optional(),
    })).min(1),
    dueDate: z.string().datetime().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export class InvoiceController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.create(req.body);
      res.status(201).json(success(invoice, 'Invoice created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, search, status, customerId } = req.query;
      const { invoices, total, page: currentPage, limit: currentLimit } = await InvoiceService.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        search: search as string,
        status: status as any,
        customerId: customerId as string,
      });
      res.json(paginated(invoices, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.findById(req.params.id);
      res.json(success(invoice));
    } catch (error) {
      next(error);
    }
  }

  static async finalize(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.finalize(req.params.id);
      res.json(success(invoice, 'Invoice finalized'));
    } catch (error) {
      next(error);
    }
  }

  static async pay(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { paymentMethodId } = req.body;
      const payment = await InvoiceService.pay(req.params.id, paymentMethodId);
      res.json(success(payment, 'Payment processed'));
    } catch (error) {
      next(error);
    }
  }

  static async void(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.void(req.params.id);
      res.json(success(invoice, 'Invoice voided'));
    } catch (error) {
      next(error);
    }
  }

  static async send(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.send(req.params.id);
      res.json(success(invoice, 'Invoice sent'));
    } catch (error) {
      next(error);
    }
  }

  static async upcoming(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subscriptionId } = req.query;
      const upcoming = await InvoiceService.upcoming(subscriptionId as string);
      res.json(success(upcoming));
    } catch (error) {
      next(error);
    }
  }

  static async generateForSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.generateForSubscription(req.params.subscriptionId);
      res.status(201).json(success(invoice, 'Invoice generated'));
    } catch (error) {
      next(error);
    }
  }

  static async getMyInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.id },
      });

      if (!customer) {
        return res.json(paginated([], 0, 1, 10));
      }

      const { invoices, total, page, limit } = await InvoiceService.findAll({
        customerId: customer.id,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });
      res.json(paginated(invoices, total, page, limit));
    } catch (error) {
      next(error);
    }
  }
}

import prisma from '../utils/prisma';