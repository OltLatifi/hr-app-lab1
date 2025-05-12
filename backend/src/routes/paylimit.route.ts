import { Router } from 'express';
import * as payLimitController from '../controllers/paylimit.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createPayLimitSchema, updatePayLimitSchema } from '../validation/paylimit.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createPayLimitSchema), payLimitController.create);
router.get('/', payLimitController.findAll);
router.get('/:id', payLimitController.findOne);
router.put('/:id', validateRequest(updatePayLimitSchema), payLimitController.update);
router.delete('/:id', payLimitController.remove);

export default router; 