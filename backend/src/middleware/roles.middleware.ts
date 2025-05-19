import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role.name !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    next();
}; 