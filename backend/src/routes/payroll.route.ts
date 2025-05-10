import { Router } from 'express';
import * as payrollController from '../controllers/payroll.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createPayrollSchema, updatePayrollSchema } from '../validation/payroll.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createPayrollSchema), payrollController.create);
router.get('/', payrollController.findAll);
router.get('/calculate-by-month', payrollController.calculateByMonth);
router.get('/calculate-by-department', payrollController.calculateByDepartment);
router.get('/:id', payrollController.findOne);
router.put('/:id', validateRequest(updatePayrollSchema), payrollController.update);
router.delete('/:id', payrollController.remove);

export default router; 