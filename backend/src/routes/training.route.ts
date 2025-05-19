import { Router } from 'express';
import * as trainingController from '../controllers/training.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createTrainingSchema, updateTrainingSchema } from '../validation/training.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createTrainingSchema), trainingController.create);
router.get('/', trainingController.findAll);
router.get('/:id', trainingController.findOne);
router.put('/:id', validateRequest(updateTrainingSchema), trainingController.update);
router.delete('/:id', trainingController.remove);
router.get('/employee/:employeeId', trainingController.getEmployeeTrainings);
router.post('/assign', trainingController.assignTraining);
router.post('/remove', trainingController.removeTraining);

export default router; 