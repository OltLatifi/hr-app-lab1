import { Router } from 'express';
import * as trainingController from '../controllers/training.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createTrainingProgramSchema, updateTrainingProgramSchema } from '../validation/training.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createTrainingProgramSchema), trainingController.create);
router.get('/', trainingController.findAll);
router.get('/:id', trainingController.findOne);
router.put('/:id', validateRequest(updateTrainingProgramSchema), trainingController.update);
router.delete('/:id', trainingController.remove);

export default router; 