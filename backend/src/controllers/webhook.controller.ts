import { Response, NextFunction, Request } from 'express';
import { WebhookService } from '../services/webhook.service';
import { success } from '../utils/response';

export class WebhookController {
  static async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      const event = WebhookService.verifySignature(payload, signature);
      await WebhookService.processEvent(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  static async getWebhookLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const logs = await WebhookService.getWebhookLogs(Number(limit) || 50);
      res.json(success(logs));
    } catch (error) {
      next(error);
    }
  }

  static async retryFailedWebhooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await WebhookService.retryFailedWebhooks();
      res.json(success(null, 'Retry initiated'));
    } catch (error) {
      next(error);
    }
  }
}

import { AuthenticatedRequest } from '../types';