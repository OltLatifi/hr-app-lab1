import db from "../db";
import { departments, employees, employmentStatuses, jobTitles } from "../db/schema";
import { eq } from "drizzle-orm";

type Employee = typeof employees.$inferSelect;
type EmployeeOrNull = Employee | null;

/**
 * Finds a employee by their ID.
 * @param employeeId - The ID of the employee to find.
 * @returns The employee object or null if not found.
 */
export const findEmployeeById = async (employeeId: number): Promise<EmployeeOrNull> => {
    const results = await db.query.employees.findFirst({
        where: eq(employees.id, employeeId),
        with: {
            jobTitle: { columns: { id: true, name: true } },
            department: { columns: { departmentId: true, departmentName: true } },
            manager: { columns: { id: true, firstName: true, lastName: true } },
            employmentStatus: { columns: { id: true, statusName: true } }
        },
    });
    return results as Employee;
};

/**
 * Retrieves all employees with their job title, department, manager, and employment status.
 * @returns A list of all employee objects with specified relations.
 */
export const getAllEmployees = async (): Promise<Array<Employee>> => {
    const results = await db.query.employees.findMany({
        with: {
            jobTitle: { columns: { id: true, name: true } },
            department: { columns: { departmentId: true, departmentName: true } },
            manager: { columns: { id: true, firstName: true, lastName: true } },
            employmentStatus: { columns: { id: true, statusName: true } }
        },
    });
    return results as Array<Employee>;
};

/**
 * Creates a new employee.
 * @param data - The data for the new employee.
 * @returns The newly created employee object.
 */
export const createEmployee = async (data: typeof employees.$inferInsert): Promise<Employee> => {
    const result = await db.insert(employees).values(data).returning();
    return (result as Employee[])[0];
};

/**
 * Updates an existing department.
 * @param employeeId - The ID of the employee to update.
 * @param data - The updated data for the employee.
 * @returns The updated employee object or null if not found.
 */
export const updateEmployee = async (employeeId: number, data: Partial<typeof employees.$inferInsert>): Promise<EmployeeOrNull> => {
    const result = await db.update(employees)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(employees.id, employeeId))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a employee.
 * @param employeeId - The ID of the employee to delete.
 * @returns The deleted employee object or null if not found.
 */
export const deleteEmployee = async (employeeId: number): Promise<EmployeeOrNull> => {
    const result = await db.delete(employees)
        .where(eq(employees.id, employeeId))
        .returning() as Array<Employee>;
    
    return result.length > 0 ? result[0] : null;
};
