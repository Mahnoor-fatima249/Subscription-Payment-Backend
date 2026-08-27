import { Router } from 'express';
import { UsageController } from '../controllers/usage.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT'));

router.post('/', UsageController.record);
router.post('/batch', UsageController.recordBatch);
router.get('/', UsageController.findAll);
router.get('/summary', UsageController.getSummary);
router.get('/by-period', UsageController.getByPeriod);
router.get('/check-limit', UsageController.checkLimit);

export default router;