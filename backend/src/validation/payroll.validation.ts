import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { payroll } from '../db/schema';

export const createPayrollSchema = createInsertSchema(payroll).omit({ companyId: true });
export const updatePayrollSchema = createPayrollSchema.partial();

export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>; 