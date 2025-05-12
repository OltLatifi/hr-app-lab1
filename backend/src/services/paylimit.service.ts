import db from "../db";
import { payLimits, departments } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

type PayLimit = typeof payLimits.$inferSelect;
type PayLimitOrNull = PayLimit | null;

/**
 * Finds a pay limit by their ID and company ID.
 * @param payLimitId - The ID of the pay limit to find.
 * @returns The pay limit object or null if not found.
 */
export const findPayLimitById = async (payLimitId: number) => {
    const result = await db.query.payLimits.findFirst({
        where: eq(payLimits.id, payLimitId),
        with: {
            department: true
        }
    });

    return result;
};

/**
 * Finds a pay limit by their ID and company ID.
 * @param payLimitId - The ID of the pay limit to find.
 * @returns The pay limit object or null if not found.
 */
export const findPayLimitByDepartmentId = async (departmentId: number) => {
    const result = await db.query.payLimits.findFirst({
        where: eq(payLimits.departmentId, departmentId),
    });

    return result;
};

/**
 * Retrieves all pay limits for a specific department.
 * @param companyId - The ID of the company.
 * @returns A list of all pay limit objects for the company.
 */
export const getAllPayLimits = async (companyId: number): Promise<Array<PayLimit>> => {
    const departmentsResult = await db.select().from(departments).where(eq(departments.companyId, companyId));
    if (!departmentsResult) {
        throw new Error('No departments found for company');
    }

    const result = await db.query.payLimits.findMany({
        where: inArray(payLimits.departmentId, departmentsResult.map(d => d.departmentId)),
        with: {
            department: true
        }
    });
    return result;
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
 * @returns The deleted pay limit object or null if not found.
 */
export const deletePayLimit = async (payLimitId: number): Promise<PayLimitOrNull> => {
    const result = await db.delete(payLimits)
        .where(eq(payLimits.id, payLimitId))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
