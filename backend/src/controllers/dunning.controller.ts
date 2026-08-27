import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { DunningService } from '../services/dunning.service';
import { success } from '../utils/response';

export class DunningController {
  static async processFailedPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const results = await DunningService.processFailedPayments();
      res.json(success(results, 'Dunning process completed'));
    } catch (error) {
      next(error);
    }
  }

  static async getDunningStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = await DunningService.getDunningStatus(req.params.customerId);
      res.json(success(status));
    } catch (error) {
      next(error);
    }
  }

  static async pauseDunning(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await DunningService.pauseDunning(req.params.invoiceId);
      res.json(success(null, 'Dunning paused'));
    } catch (error) {
      next(error);
    }
  }

  static async resumeDunning(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await DunningService.resumeDunning(req.params.invoiceId);
      res.json(success(null, 'Dunning resumed'));
    } catch (error) {
      next(error);
    }
  }

  static async getDunningMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await DunningService.getDunningMetrics();
      res.json(success(metrics));
    } catch (error) {
      next(error);
    }
  }

  static async getMyDunningStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.id },
      });

      if (!customer) {
        return res.json(success([]));
      }

      const status = await DunningService.getDunningStatus(customer.id);
      res.json(success(status));
    } catch (error) {
      next(error);
    }
  }
}

import prisma from '../utils/prisma';