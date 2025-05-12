import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { payLimits } from '../db/schema';

export const createPayLimitSchema = createInsertSchema(payLimits).omit({ departmentId: true });
export const updatePayLimitSchema = createPayLimitSchema.partial();

export type CreatePayLimitInput = z.infer<typeof createPayLimitSchema>;
export type UpdatePayLimitInput = z.infer<typeof updatePayLimitSchema>;