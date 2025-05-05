import db from "../db";
import { leaveTypes } from "../db/schema";
import { eq, and } from "drizzle-orm";

type LeaveType = typeof leaveTypes.$inferSelect;
type LeaveTypeOrNull = LeaveType | null;

/**
 * Finds a leave type by their ID and company ID.
 * @param leaveTypeId - The ID of the leave type to find.
 * @param companyId - The ID of the company the leave type belongs to.
 * @returns The leave type object or null if not found.
 */
export const findLeaveTypeById = async (leaveTypeId: number, companyId: number): Promise<LeaveTypeOrNull> => {
    const result = await db.select()
    .from(leaveTypes)
    .where(and(eq(leaveTypes.id, leaveTypeId), eq(leaveTypes.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all leave types for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all leave type objects for the company.
 */
export const getAllLeaveTypes = async (companyId: number): Promise<Array<LeaveType>> => {
    return await db.select().from(leaveTypes).where(eq(leaveTypes.companyId, companyId));
};

/**
 * Creates a new leave type. Assumes companyId is included in the data.
 * @param data - The data for the new leave type, including companyId.
 * @returns The newly created leave type object.
 */
export const createLeaveType = async (data: typeof leaveTypes.$inferInsert): Promise<LeaveType> => {
    const result = await db.insert(leaveTypes).values(data).returning();
    return result[0];
};

/**
 * Updates an existing leave type.
 * @param leaveTypeId - The ID of the leave type to update.
 * @param companyId - The ID of the company the leave type belongs to.
 * @param data - The updated data for the leave type.
 * @returns The updated leave type object or null if not found.
 */
export const updateLeaveType = async (leaveTypeId: number, companyId: number, data: Partial<typeof leaveTypes.$inferInsert>): Promise<LeaveTypeOrNull> => {
    const result = await db.update(leaveTypes)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(leaveTypes.id, leaveTypeId), eq(leaveTypes.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a leave type.
 * @param leaveTypeId - The ID of the leave type to delete.
 * @param companyId - The ID of the company the leave type belongs to.
 * @returns The deleted leave type object or null if not found.
 */
export const deleteLeaveType = async (leaveTypeId: number, companyId: number): Promise<LeaveTypeOrNull> => {
    const result = await db.delete(leaveTypes)
        .where(and(eq(leaveTypes.id, leaveTypeId), eq(leaveTypes.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
