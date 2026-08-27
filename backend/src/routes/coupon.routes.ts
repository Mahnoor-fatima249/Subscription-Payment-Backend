import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT'));

router.post('/', CouponController.create);
router.get('/', CouponController.findAll);
router.get('/:id', CouponController.findById);
router.get('/code/:code', CouponController.findByCode);
router.get('/validate/:code', CouponController.validate);
router.post('/apply', CouponController.applyToSubscription);
router.delete('/:subscriptionId/coupons/:couponId', CouponController.removeFromSubscription);
router.put('/:id', CouponController.update);
router.delete('/:id', CouponController.delete);
router.get('/plan/:planId/active', CouponController.getActiveForPlan);

export default router;