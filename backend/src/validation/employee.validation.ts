import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { employees } from '../db/schema';

export const createEmployeeSchema = createInsertSchema(employees).omit({ companyId: true });

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>; 