import db from "../db";
import { payLimits } from "../db/schema";
import { eq, and } from "drizzle-orm";

type PayLimit = typeof payLimits.$inferSelect;
type PayLimitOrNull = PayLimit | null;

/**
 * Finds a pay limit by their ID and company ID.
 * @param payLimitId - The ID of the pay limit to find.
 * @returns The pay limit object or null if not found.
 */
export const findPayLimitById = async (payLimitId: number): Promise<PayLimitOrNull> => {
    const result = await db.select()
    .from(payLimits)
    .where(eq(payLimits.id, payLimitId))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all pay limits for a specific department.
 * @param departmentId - The ID of the department.
 * @returns A list of all pay limit objects for the department.
 */
export const getAllPayLimits = async (departmentId: number): Promise<Array<PayLimit>> => {
    return await db.select().from(payLimits).where(eq(payLimits.departmentId, departmentId));
};

/**
 * Creates a new pay limit. Assumes departmentId is included in the data.
 * @param data - The data for the new pay limit, including departmentId.
 * @returns The newly created pay limit object.
 */
export const createPayLimit = async (data: typeof payLimits.$inferInsert): Promise<PayLimit> => {
    const result = await db.insert(payLimits).values(data).returning();
    return result[0];
};

/**
 * Updates an existing pay limit.
 * @param payLimitId - The ID of the pay limit to update.
 * @param departmentId - The ID of the department the pay limit belongs to.
 * @param data - The updated data for the pay limit.
 * @returns The updated pay limit object or null if not found.
 */
export const updatePayLimit = async (payLimitId: number, data: Partial<typeof payLimits.$inferInsert>): Promise<PayLimitOrNull> => {
    const result = await db.update(payLimits)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(payLimits.id, payLimitId))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a pay limit.
 * @param payLimitId - The ID of the pay limit to delete.
 * @param departmentId - The ID of the department the pay limit belongs to.
 * @returns The deleted pay limit object or null if not found.
 */
export const deletePayLimit = async (payLimitId: number): Promise<PayLimitOrNull> => {
    const result = await db.delete(payLimits)
        .where(eq(payLimits.id, payLimitId))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
