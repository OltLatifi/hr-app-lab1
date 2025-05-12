import db from "../db";
import { leaveRequests } from "../db/schema";
import { eq, and } from "drizzle-orm";

type LeaveRequest = typeof leaveRequests.$inferSelect;
type LeaveRequestOrNull = LeaveRequest | null;

/**
 * Finds a leave request by their ID and company ID.
 * @param leaveRequestId - The ID of the leave request to find.
 * @param companyId - The ID of the company the leave request belongs to.
 * @returns The leave request object or null if not found.
 */
export const findLeaveRequestById = async (leaveRequestId: number, companyId: number): Promise<LeaveRequestOrNull> => {
    const result = await db.select()
    .from(leaveRequests)
    .where(and(eq(leaveRequests.id, leaveRequestId), eq(leaveRequests.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all leave requests for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all leave request objects for the company.
 */
export const getAllLeaveRequests = async (companyId: number): Promise<Array<LeaveRequest>> => {
    return await db.select().from(leaveRequests).where(eq(leaveRequests.companyId, companyId));
};

/**
 * Creates a new leave request. Assumes companyId is included in the data.
 * @param data - The data for the new leave request, including companyId.
 * @returns The newly created leave request object.
 */
export const createLeaveRequest = async (data: typeof leaveRequests.$inferInsert): Promise<LeaveRequest> => {
    const result = await db.insert(leaveRequests).values(data).returning();
    return result[0];
};

/**
 * Updates an existing leave request.
 * @param leaveRequestId - The ID of the leave request to update.
 * @param companyId - The ID of the company the leave request belongs to.
 * @param data - The updated data for the leave request.
 * @returns The updated leave request object or null if not found.
 */
export const updateLeaveRequest = async (leaveRequestId: number, companyId: number, data: Partial<typeof leaveRequests.$inferInsert>): Promise<LeaveRequestOrNull> => {
    const result = await db.update(leaveRequests)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(leaveRequests.id, leaveRequestId), eq(leaveRequests.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a leave request.
 * @param leaveRequestId - The ID of the leave request to delete.
 * @param companyId - The ID of the company the leave request belongs to.
 * @returns The deleted leave request object or null if not found.
 */
export const deleteLeaveRequest = async (leaveRequestId: number, companyId: number): Promise<LeaveRequestOrNull> => {
    const result = await db.delete(leaveRequests)
        .where(and(eq(leaveRequests.id, leaveRequestId), eq(leaveRequests.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
