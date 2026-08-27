import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Customer routes (own subscriptions)
router.get('/my', SubscriptionController.getMySubscriptions);

// Admin routes
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT'));
router.post('/', SubscriptionController.create);
router.get('/', SubscriptionController.findAll);
router.get('/:id', SubscriptionController.findById);
router.put('/:id', SubscriptionController.update);
router.post('/:id/cancel', SubscriptionController.cancel);
router.post('/:id/pause', SubscriptionController.pause);
router.post('/:id/resume', SubscriptionController.resume);
router.get('/:id/upcoming-invoice', SubscriptionController.getUpcomingInvoice);
router.get('/:id/events', SubscriptionController.getEvents);

export default router;