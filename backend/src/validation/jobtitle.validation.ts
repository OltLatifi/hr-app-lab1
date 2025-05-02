import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { jobTitles } from '../db/schema';

export const createJobTitleSchema = createInsertSchema(jobTitles);
export const updateJobTitleSchema = createJobTitleSchema.partial();

export type CreateJobTitleInput = z.infer<typeof createJobTitleSchema>;
export type UpdateJobTitleInput = z.infer<typeof updateJobTitleSchema>; 