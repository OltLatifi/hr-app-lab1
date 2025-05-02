import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.utils';
import { authConfig } from '../config/auth.config';
import { findUserById } from '../services/user.service';

declare global {
    namespace Express {
        interface Request {
            user?: { id: number; name: string; email: string };
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Authenticating token');
    console.log('Cookies:', req.cookies);
    const token = req.cookies[authConfig.cookies.access];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required: No token provided.' });
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
        return res.status(403).json({ message: 'Authentication failed: Invalid or expired token.' });
    }

    console.log('Payload:', payload);

    try {
        const user = await findUserById(payload.userId);
        if (!user) {
            return res.status(404).json({ message: 'Authenticated user not found.' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error fetching user during authentication:", error);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
}; 