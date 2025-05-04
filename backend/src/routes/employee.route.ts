import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createEmployeeSchema, updateEmployeeSchema } from '../validation/employee.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createEmployeeSchema), employeeController.create);
router.get('/', employeeController.findAll);
router.get('/:id', employeeController.findOne);
router.put('/:id', validateRequest(updateEmployeeSchema), employeeController.update);
router.delete('/:id', employeeController.remove);

export default router; 