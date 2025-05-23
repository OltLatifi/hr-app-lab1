import { Router } from 'express';
import * as benefitController from '../controllers/benefit.controller';
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
router.get('/employee/:employeeId', benefitController.getEmployeeBenefits);
router.post('/assign', benefitController.assignBenefit);
router.post('/remove', benefitController.removeBenefit);

export default router;