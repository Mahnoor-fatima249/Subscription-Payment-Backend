import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Customer profile (own)
router.get('/me', CustomerController.getMyProfile);

// Admin routes
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT'));
router.post('/', CustomerController.create);
router.get('/', CustomerController.findAll);
router.get('/user/:userId', CustomerController.findByUserId);
router.get('/:id', CustomerController.findById);
router.put('/:id', CustomerController.update);
router.post('/:id/sync', CustomerController.syncWithStripe);

export default router;