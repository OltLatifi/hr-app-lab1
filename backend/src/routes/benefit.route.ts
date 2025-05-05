import { Router } from 'express';
import * as benefitController from '../controllers/benefits.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createBenefitSchema, updateBenefitSchema } from '../validation/benefit.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createBenefitSchema), benefitController.create);
router.get('/', benefitController.findAll);
router.get('/:id', benefitController.findOne);
router.put('/:id', validateRequest(updateBenefitSchema), benefitController.update);
router.delete('/:id', benefitController.remove);

export default router;