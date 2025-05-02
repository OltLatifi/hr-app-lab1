import { Router } from 'express';
import * as employmentStatusController from '../controllers/employmentstatus.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createEmploymentStatusSchema, updateEmploymentStatusSchema } from '../validation/employmentstatus.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createEmploymentStatusSchema), employmentStatusController.create);
router.get('/', employmentStatusController.findAll);
router.get('/:id', employmentStatusController.findOne);
router.put('/:id', validateRequest(updateEmploymentStatusSchema), employmentStatusController.update);
router.delete('/:id', employmentStatusController.remove);

export default router; 