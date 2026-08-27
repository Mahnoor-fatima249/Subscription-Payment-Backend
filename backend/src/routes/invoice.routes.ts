import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Customer routes (own invoices)
router.get('/my', InvoiceController.getMyInvoices);

// Admin routes
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT'));
router.post('/', InvoiceController.create);
router.get('/', InvoiceController.findAll);
router.get('/:id', InvoiceController.findById);
router.post('/:id/finalize', InvoiceController.finalize);
router.post('/:id/pay', InvoiceController.pay);
router.post('/:id/void', InvoiceController.void);
router.post('/:id/send', InvoiceController.send);
router.get('/upcoming', InvoiceController.upcoming);
router.post('/subscription/:subscriptionId/generate', InvoiceController.generateForSubscription);

export default router;