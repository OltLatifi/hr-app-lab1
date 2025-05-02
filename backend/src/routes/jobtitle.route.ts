import { Router } from 'express';
import * as jobTitleController from '../controllers/jobtitle.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createJobTitleSchema, updateJobTitleSchema } from '../validation/jobtitle.validation';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(createJobTitleSchema), jobTitleController.create);
router.get('/', jobTitleController.findAll);
router.get('/:id', jobTitleController.findOne);
router.put('/:id', validateRequest(updateJobTitleSchema), jobTitleController.update);
router.delete('/:id', jobTitleController.remove);

export default router; 