import { Router } from 'express';
import * as leaveController from '../controllers/leave.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createLeaveRequestSchema, updateLeaveRequestSchema } from '../validation/leave.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createLeaveRequestSchema), leaveController.create);
router.get('/', leaveController.findAll);
router.get('/:id', leaveController.findOne);
router.put('/:id', validateRequest(updateLeaveRequestSchema), leaveController.update);
router.delete('/:id', leaveController.remove);

export default router; 