import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest.middleware';
import { createUserSchema, loginSchema } from '../validation/user.validation';

const router: Router = express.Router();

router.get('/status', authenticateToken, authController.getStatus);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post("/register", validateRequest(createUserSchema), authController.register);
router.post('/register-admin', authController.registerAdmin);
router.get('/invitations/validate/:token', authController.validateInvitation);

export default router; 