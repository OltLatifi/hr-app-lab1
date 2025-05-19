import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { trainingPrograms } from '../db/schema';

export const createTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({ companyId: true });
export const updateTrainingProgramSchema = createTrainingProgramSchema.partial();

export type CreateTrainingProgramInput = z.infer<typeof createTrainingProgramSchema>;
export type UpdateTrainingProgramInput = z.infer<typeof updateTrainingProgramSchema>;

export const createTrainingSchema = z.object({
    name: z.string().min(1, 'Training name is required'),
});

export const updateTrainingSchema = z.object({
    name: z.string().min(1, 'Training name is required'),
}); 