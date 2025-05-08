import { Router } from 'express';
import * as trainingController from '../controllers/training.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createPayrollSchema, updatePayrollSchema } from '../validation/payroll.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createPayrollSchema), trainingController.create);
router.get('/', trainingController.findAll);
router.get('/:id', trainingController.findOne);
router.put('/:id', validateRequest(updatePayrollSchema), trainingController.update);
router.delete('/:id', trainingController.remove);

export default router; 