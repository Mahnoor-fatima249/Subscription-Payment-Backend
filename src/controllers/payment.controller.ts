import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { PaymentService } from '../services/payment.service';
import { success, paginated } from '../utils/response';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const checkoutSessionSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    planId: z.string().uuid(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    quantity: z.number().int().positive().default(1),
    trialDays: z.number().int().min(0).optional(),
    couponCode: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

const billingPortalSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    returnUrl: z.string().url(),
  }),
});

const attachPaymentMethodSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    paymentMethodId: z.string(),
    setAsDefault: z.boolean().default(false),
  }),
});

const refundSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid(),
    amount: z.number().positive().optional(),
    reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  }),
});

export class PaymentController {
  static async createCheckoutSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const session = await PaymentService.createCheckoutSession(req.body);
      res.json(success(session));
    } catch (error) {
      next(error);
    }
  }

  static async createBillingPortalSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const session = await PaymentService.createBillingPortalSession(req.body);
      res.json(success(session));
    } catch (error) {
      next(error);
    }
  }

  static async attachPaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paymentMethod = await PaymentService.attachPaymentMethod(req.body);
      res.status(201).json(success(paymentMethod, 'Payment method attached'));
    } catch (error) {
      next(error);
    }
  }

  static async detachPaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await PaymentService.detachPaymentMethod(req.params.paymentMethodId);
      res.json(success(null, 'Payment method removed'));
    } catch (error) {
      next(error);
    }
  }

  static async listPaymentMethods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const paymentMethods = await PaymentService.listPaymentMethods(req.params.customerId);
      res.json(success(paymentMethods));
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, customerId, status } = req.query;
      const { payments, total, page: currentPage, limit: currentLimit } = await PaymentService.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        customerId: customerId as string,
        status: status as string,
      });
      res.json(paginated(payments, total, currentPage, currentLimit));
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.findById(req.params.id);
      res.json(success(payment));
    } catch (error) {
      next(error);
    }
  }

  static async refund(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refund = await PaymentService.refund(req.body);
      res.json(success(refund, 'Refund processed'));
    } catch (error) {
      next(error);
    }
  }
}