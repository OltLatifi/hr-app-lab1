import db from "../db";
import { employmentStatuses } from "../db/schema";
import { eq, and } from "drizzle-orm";

type EmploymentStatus = typeof employmentStatuses.$inferSelect;
type EmploymentStatusOrNull = EmploymentStatus | null;

/**
 * Finds a employment status by their ID.
 * @param employmentStatusId - The ID of the employment status to find.
 * @param companyId - The ID of the company the employment status belongs to.
 * @returns The employment status object or null if not found.
 */
export const findEmploymentStatusById = async (employmentStatusId: number, companyId: number): Promise<EmploymentStatusOrNull> => {
    const result = await db.select()
    .from(employmentStatuses)
    .where(and(eq(employmentStatuses.id, employmentStatusId), eq(employmentStatuses.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all employment statuses.
 * @param companyId - The ID of the company.
 * @returns A list of all employment status objects for the company.
 */ 
export const getAllEmploymentStatuses = async (companyId: number): Promise<Array<EmploymentStatus>> => {
    return await db.select().from(employmentStatuses).where(eq(employmentStatuses.companyId, companyId));
};

/**
 * Creates a new employment status.
 * @param data - The data for the new employment status.
 * @returns The newly created employment status object.
 */
export const createEmploymentStatus = async (data: typeof employmentStatuses.$inferInsert): Promise<EmploymentStatus> => {
    const result = await db.insert(employmentStatuses).values(data).returning();
    return result[0];
};

/**
 * Updates an existing department.
 * @param employmentStatusId - The ID of the employment status to update.
 * @param data - The updated data for the employment status.
 * @returns The updated employment status object or null if not found.
 */
export const updateEmploymentStatus = async (employmentStatusId: number, companyId: number, data: Partial<typeof employmentStatuses.$inferInsert>): Promise<EmploymentStatusOrNull> => {
    const result = await db.update(employmentStatuses)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(employmentStatuses.id, employmentStatusId), eq(employmentStatuses.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a employment status.
 * @param employmentStatusId - The ID of the employment status to delete.
 * @param companyId - The ID of the company the employment status belongs to.
 * @returns The deleted employment status object or null if not found.
 */
export const deleteEmploymentStatus = async (employmentStatusId: number, companyId: number): Promise<EmploymentStatusOrNull> => {
    const result = await db.delete(employmentStatuses)
        .where(and(eq(employmentStatuses.id, employmentStatusId), eq(employmentStatuses.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
