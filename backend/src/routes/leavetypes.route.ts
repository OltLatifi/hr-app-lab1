import { Router } from 'express';
import * as leaveTypeController from '../controllers/leavetype.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createLeaveTypeSchema, updateLeaveTypeSchema } from '../validation/leavetype.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createLeaveTypeSchema), leaveTypeController.create);
router.get('/', leaveTypeController.findAll);
router.get('/:id', leaveTypeController.findOne);
router.put('/:id', validateRequest(updateLeaveTypeSchema), leaveTypeController.update);
router.delete('/:id', leaveTypeController.remove);

export default router;