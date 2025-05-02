import { Router } from 'express';
import * as departmentController from '../controllers/department.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createDepartmentSchema, updateDepartmentSchema } from '../validation/department.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createDepartmentSchema), departmentController.create);
router.get('/', departmentController.findAll);
router.get('/:id', departmentController.findOne);
router.put('/:id', validateRequest(updateDepartmentSchema), departmentController.update);
router.delete('/:id', departmentController.remove);

export default router; 