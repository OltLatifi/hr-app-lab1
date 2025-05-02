import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { departments } from '../db/schema';

export const createDepartmentSchema = createInsertSchema(departments, {
    departmentName: z.string().min(1, { message: 'Department name cannot be empty' }).max(255),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>; 