import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ReportingService } from '../services/reporting.service';
import { success } from '../utils/response';

export class ReportingController {
  static async getRevenueMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const metrics = await ReportingService.getRevenueMetrics(start, end);
      res.json(success(metrics));
    } catch (error) {
      next(error);
    }
  }

  static async getSubscriptionMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await ReportingService.getSubscriptionMetrics();
      res.json(success(metrics));
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await ReportingService.getCustomerMetrics();
      res.json(success(metrics));
    } catch (error) {
      next(error);
    }
  }

  static async getPlanPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const performance = await ReportingService.getPlanPerformance();
      res.json(success(performance));
    } catch (error) {
      next(error);
    }
  }

  static async getUsageReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const report = await ReportingService.getUsageReport(start, end);
      res.json(success(report));
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const [revenue, subscriptions, customers, plans] = await Promise.all([
        ReportingService.getRevenueMetrics(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        ),
        ReportingService.getSubscriptionMetrics(),
        ReportingService.getCustomerMetrics(),
        ReportingService.getPlanPerformance(),
      ]);

      res.json(success({
        revenue,
        subscriptions,
        customers,
        plans,
      }));
    } catch (error) {
      next(error);
    }
  }
}