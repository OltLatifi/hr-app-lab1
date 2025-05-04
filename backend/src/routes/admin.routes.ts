import { Router } from 'express';
import { inviteAdmin } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/invite', authenticateToken, inviteAdmin);

export default router; 