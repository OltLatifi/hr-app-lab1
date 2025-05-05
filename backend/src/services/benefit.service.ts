import db from "../db";
import { benefits } from "../db/schema";
import { eq, and } from "drizzle-orm";

type Benefit = typeof benefits.$inferSelect;
type BenefitOrNull = Benefit | null;

/**
 * Finds a benefit by their ID and company ID.
 * @param benefitId - The ID of the benefit to find.
 * @param companyId - The ID of the company the benefit belongs to.
 * @returns The benefit object or null if not found.
 */
export const findBenefitById = async (benefitId: number, companyId: number): Promise<BenefitOrNull> => {
    const result = await db.select()
    .from(benefits)
    .where(and(eq(benefits.id, benefitId), eq(benefits.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all benefits for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all benefit objects for the company.
 */
export const getAllBenefits = async (companyId: number): Promise<Array<Benefit>> => {
    return await db.select().from(benefits).where(eq(benefits.companyId, companyId));
};

/**
 * Creates a new benefit. Assumes companyId is included in the data.
 * @param data - The data for the new benefit, including companyId.
 * @returns The newly created benefit object.
 */
export const createBenefit = async (data: typeof benefits.$inferInsert): Promise<Benefit> => {
    const result = await db.insert(benefits).values(data).returning();
    return result[0];
};

/**
 * Updates an existing benefit.
 * @param benefitId - The ID of the benefit to update.
 * @param companyId - The ID of the company the benefit belongs to.
 * @param data - The updated data for the benefit.
 * @returns The updated benefit object or null if not found.
 */
export const updateBenefit = async (benefitId: number, companyId: number, data: Partial<typeof benefits.$inferInsert>): Promise<BenefitOrNull> => {
    const result = await db.update(benefits)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(benefits.id, benefitId), eq(benefits.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a benefit.
 * @param benefitId - The ID of the benefit to delete.
 * @param companyId - The ID of the company the benefit belongs to.
 * @returns The deleted benefit object or null if not found.
 */
export const deleteBenefit = async (benefitId: number, companyId: number): Promise<BenefitOrNull> => {
    const result = await db.delete(benefits)
        .where(and(eq(benefits.id, benefitId), eq(benefits.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
