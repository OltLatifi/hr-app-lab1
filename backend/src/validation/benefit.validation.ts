import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { benefits } from '../db/schema';

export const createBenefitSchema = createInsertSchema(benefits).omit({ companyId: true });
export const updateBenefitSchema = createBenefitSchema.partial();

export type CreateBenefitInput = z.infer<typeof createBenefitSchema>;
export type UpdateBenefitInput = z.infer<typeof updateBenefitSchema>; 