import db from "../db";
import { departments } from "../db/schema";
import { eq } from "drizzle-orm";

type Department = typeof departments.$inferSelect;
type DepartmentOrNull = Department | null;

/**
 * Finds a department by their ID.
 * @param departmentId - The ID of the department to find.
 * @returns The department object or null if not found.
 */
export const findDepartmentById = async (departmentId: number): Promise<DepartmentOrNull> => {
    const result = await db.select()
    .from(departments)
    .where(eq(departments.departmentId, departmentId))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all departments.
 * @returns A list of all department objects.
 */
export const getAllDepartments = async (): Promise<Array<Department>> => {
    return await db.select().from(departments);
};

/**
 * Creates a new department.
 * @param data - The data for the new department.
 * @returns The newly created department object.
 */
export const createDepartment = async (data: typeof departments.$inferInsert): Promise<Department> => {
    const result = await db.insert(departments).values(data).returning();
    return result[0];
};

/**
 * Updates an existing department.
 * @param departmentId - The ID of the department to update.
 * @param data - The updated data for the department.
 * @returns The updated department object or null if not found.
 */
export const updateDepartment = async (departmentId: number, data: Partial<typeof departments.$inferInsert>): Promise<DepartmentOrNull> => {
    const result = await db.update(departments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(departments.departmentId, departmentId))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a department.
 * @param departmentId - The ID of the department to delete.
 * @returns The deleted department object or null if not found.
 */
export const deleteDepartment = async (departmentId: number): Promise<DepartmentOrNull> => {
    const result = await db.delete(departments)
        .where(eq(departments.departmentId, departmentId))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
