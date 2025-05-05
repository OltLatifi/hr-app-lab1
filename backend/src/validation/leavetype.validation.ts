import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { leaveTypes } from '../db/schema';

export const createLeaveTypeSchema = createInsertSchema(leaveTypes).omit({ companyId: true });
export const updateLeaveTypeSchema = createLeaveTypeSchema.partial();

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>; 