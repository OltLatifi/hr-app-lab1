import { Router } from 'express';
import { 
    createSubscriptionController, 
    updateSubscriptionController, 
    cancelSubscriptionController, 
    getPlans,
    getSubscriptionStatusController 
} from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/plans', getPlans);
router.get('/status/:companyId', getSubscriptionStatusController);
router.post('/create', createSubscriptionController);
router.post('/update', updateSubscriptionController);
router.post('/cancel', cancelSubscriptionController);

export default router; 