import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Admin routes
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE'));
router.post('/checkout-session', PaymentController.createCheckoutSession);
router.post('/billing-portal', PaymentController.createBillingPortalSession);
router.post('/payment-methods', PaymentController.attachPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', PaymentController.detachPaymentMethod);
router.get('/payment-methods/:customerId', PaymentController.listPaymentMethods);
router.get('/', PaymentController.findAll);
router.get('/:id', PaymentController.findById);
router.post('/refund', PaymentController.refund);

export default router;