import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { leaveRequests } from '../db/schema';

export const createLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ companyId: true });
export const updateLeaveRequestSchema = createLeaveRequestSchema.partial();

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>; 