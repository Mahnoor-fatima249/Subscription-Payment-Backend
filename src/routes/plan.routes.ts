import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const addFeatureSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    value: z.string(),
    description: z.string().optional(),
    isLimit: z.boolean().default(false),
    limitValue: z.number().int().positive().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

const addTierSchema = z.object({
  body: z.object({
    upTo: z.number().int().positive(),
    perUnitPrice: z.number().positive(),
    flatFee: z.number().min(0).default(0),
    description: z.string().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

// Public routes (for viewing plans)
router.get('/', PlanController.findAll);
router.get('/slug/:slug', PlanController.findBySlug);
router.get('/:id', PlanController.findById);

// Admin routes
router.use(authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'FINANCE'));
router.post('/', PlanController.create);
router.put('/:id', PlanController.update);
router.delete('/:id', PlanController.delete);

router.post('/:id/features', validate(addFeatureSchema), PlanController.addFeature);
router.put('/features/:featureId', PlanController.updateFeature);
router.delete('/features/:featureId', PlanController.removeFeature);

router.post('/:id/tiers', validate(addTierSchema), PlanController.addTier);
router.put('/tiers/:tierId', PlanController.updateTier);
router.delete('/tiers/:tierId', PlanController.removeTier);

export default router;