import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { employmentStatuses } from '../db/schema';

export const createEmploymentStatusSchema = createInsertSchema(employmentStatuses).omit({ companyId: true });
export const updateEmploymentStatusSchema = createEmploymentStatusSchema.partial();

export type CreateEmploymentStatusInput = z.infer<typeof createEmploymentStatusSchema>;
export type UpdateEmploymentStatusInput = z.infer<typeof updateEmploymentStatusSchema>; 