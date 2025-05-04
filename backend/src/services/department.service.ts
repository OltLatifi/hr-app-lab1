import db from "../db";
import { departments } from "../db/schema";
import { eq, and } from "drizzle-orm";

type Department = typeof departments.$inferSelect;
type DepartmentOrNull = Department | null;

/**
 * Finds a department by their ID and company ID.
 * @param departmentId - The ID of the department to find.
 * @param companyId - The ID of the company the department belongs to.
 * @returns The department object or null if not found.
 */
export const findDepartmentById = async (departmentId: number, companyId: number): Promise<DepartmentOrNull> => {
    const result = await db.select()
    .from(departments)
    .where(and(eq(departments.departmentId, departmentId), eq(departments.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all departments for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all department objects for the company.
 */
export const getAllDepartments = async (companyId: number): Promise<Array<Department>> => {
    return await db.select().from(departments).where(eq(departments.companyId, companyId));
};

/**
 * Creates a new department. Assumes companyId is included in the data.
 * @param data - The data for the new department, including companyId.
 * @returns The newly created department object.
 */
export const createDepartment = async (data: typeof departments.$inferInsert): Promise<Department> => {
    const result = await db.insert(departments).values(data).returning();
    return result[0];
};

/**
 * Updates an existing department.
 * @param departmentId - The ID of the department to update.
 * @param companyId - The ID of the company the department belongs to.
 * @param data - The updated data for the department.
 * @returns The updated department object or null if not found.
 */
export const updateDepartment = async (departmentId: number, companyId: number, data: Partial<typeof departments.$inferInsert>): Promise<DepartmentOrNull> => {
    const result = await db.update(departments)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(departments.departmentId, departmentId), eq(departments.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a department.
 * @param departmentId - The ID of the department to delete.
 * @param companyId - The ID of the company the department belongs to.
 * @returns The deleted department object or null if not found.
 */
export const deleteDepartment = async (departmentId: number, companyId: number): Promise<DepartmentOrNull> => {
    const result = await db.delete(departments)
        .where(and(eq(departments.departmentId, departmentId), eq(departments.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
