import { Router } from 'express';
import { ReportingController } from '../controllers/reporting.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE'));

router.get('/dashboard', ReportingController.getDashboard);
router.get('/revenue', ReportingController.getRevenueMetrics);
router.get('/subscriptions', ReportingController.getSubscriptionMetrics);
router.get('/customers', ReportingController.getCustomerMetrics);
router.get('/plans', ReportingController.getPlanPerformance);
router.get('/usage', ReportingController.getUsageReport);

export default router;