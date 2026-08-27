import { Router } from 'express';
import { DunningController } from '../controllers/dunning.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Customer routes (own dunning status)
router.get('/my', DunningController.getMyDunningStatus);

// Admin routes
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE'));
router.post('/process', DunningController.processFailedPayments);
router.get('/customer/:customerId', DunningController.getDunningStatus);
router.post('/:invoiceId/pause', DunningController.pauseDunning);
router.post('/:invoiceId/resume', DunningController.resumeDunning);
router.get('/metrics', DunningController.getDunningMetrics);

export default router;