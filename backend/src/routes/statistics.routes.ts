import { Router } from 'express';
import { getCompanyStats, getEmployeeStats, getTrainingStats, getLeaveStats } from '../controllers/statistics.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/roles.middleware';

const router = Router();

router.get('/company', authenticateToken, isAdmin, getCompanyStats);
router.get('/employee', authenticateToken, isAdmin, getEmployeeStats);
router.get('/training', authenticateToken, isAdmin, getTrainingStats);
router.get('/leave', authenticateToken, isAdmin, getLeaveStats);

export default router; 