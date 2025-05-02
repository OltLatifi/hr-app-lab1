import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => 
    async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
        }
        console.error('Unexpected validation error:', error);
        return res.status(500).json({ message: 'Internal server error during validation' });
    }
}; 