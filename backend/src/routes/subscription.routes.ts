import { Router } from 'express';
import { createSubscriptionController, updateSubscriptionController, cancelSubscriptionController, getPlans } from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/create', createSubscriptionController);
router.post('/update', updateSubscriptionController);
router.post('/cancel', cancelSubscriptionController);
router.get('/plans', getPlans);

export default router; 