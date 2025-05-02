import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AuthTokenPayload } from '../utils/auth.utils';
import { authConfig } from '../config/auth.config';
import { findUserById } from '../services/user.service';
import { User } from '../db/schema';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[authConfig.cookies.access];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required: No token provided.' });
    }

    const payload: AuthTokenPayload | null = verifyAccessToken(token);

    if (!payload) {
        return res.status(401).json({ message: 'Authentication failed: Invalid or expired token.' });
    }

    try {
        const user = await findUserById(payload.userId);
        if (!user) {
            res.clearCookie(authConfig.cookies.access);
            return res.status(401).json({ message: 'Authentication failed: User not found.' });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error('Error fetching user during authentication:', error);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
}; 