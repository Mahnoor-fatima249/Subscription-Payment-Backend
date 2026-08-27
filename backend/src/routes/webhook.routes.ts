import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Stripe webhook - no auth, uses signature verification
router.post('/stripe', WebhookController.handleStripeWebhook);

// Admin routes
router.use(authenticate, authorize('SUPER_ADMIN', 'ADMIN'));
router.get('/logs', WebhookController.getWebhookLogs);
router.post('/retry', WebhookController.retryFailedWebhooks);

export default router;