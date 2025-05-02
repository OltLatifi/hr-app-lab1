import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { users } from '../db/schema';

export const createUserSchema = createInsertSchema(users);
export const updateUserSchema = createUserSchema.partial();

export const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>; 
export type LoginInput = z.infer<typeof loginSchema>;