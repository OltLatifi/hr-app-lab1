import db from "../db";
import { employees, company } from "../db/schema";
import { eq, and, or, like, SQL, sql } from "drizzle-orm";

type Employee = typeof employees.$inferSelect;
type EmployeeOrNull = Employee | null;

/**
 * Finds a employee by their ID.
 * @param employeeId - The ID of the employee to find.
 * @param companyId - The ID of the company the employee belongs to.
 * @returns The employee object or null if not found.
 */
export const findEmployeeById = async (employeeId: number, companyId: number): Promise<EmployeeOrNull> => {
    const results = await db.query.employees.findFirst({
        where: and(eq(employees.id, employeeId), eq(employees.companyId, companyId)),

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
 * Finds a employee by their email.
 * @param email - The email of the employee to find.
 * @param companyId - The ID of the company the employee belongs to.
 * @returns The employee object or null if not found.
 */
export const findEmployeeByEmail = async (email: string): Promise<EmployeeOrNull> => {
    const results = await db.query.employees.findFirst({
        where: eq(employees.email, email),

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
 * @param companyId - The ID of the company the employees belong to.
 * @param filters - Optional filters for departmentId, managerId, statusId, and searchTerm.
 * @returns A list of all employee objects with specified relations.
 */
export interface EmployeeQueryFilters {
    departmentId?: string;
    managerId?: string;
    statusId?: string;
    searchTerm?: string;
}

export const getAllEmployees = async (companyId: number, filters?: EmployeeQueryFilters): Promise<Array<Employee>> => {
    const baseCondition = eq(employees.companyId, companyId);
    const additionalConditions: SQL[] = [];

    if (filters) {
        if (filters.departmentId) {
            additionalConditions.push(eq(employees.departmentId, Number(filters.departmentId)));
        }
        if (filters.managerId) {
            additionalConditions.push(eq(employees.managerId, Number(filters.managerId)));
        }
        if (filters.statusId) {
            additionalConditions.push(eq(employees.employmentStatusId, Number(filters.statusId)));
        }
        if (filters.searchTerm) {
            const searchTermCondition = `%${filters.searchTerm}%`;
            additionalConditions.push(
                or(
                    like(employees.firstName, searchTermCondition),
                    like(employees.lastName, searchTermCondition),
                    like(employees.email, searchTermCondition)
                )!
            );
        }
    }

    const queryConfig = {
        where: additionalConditions.length > 0 ? and(baseCondition, ...additionalConditions) : baseCondition,
        with: {
            jobTitle: { columns: { id: true, name: true } },
            department: { columns: { departmentId: true, departmentName: true } },
            manager: { columns: { id: true, firstName: true, lastName: true } },
            employmentStatus: { columns: { id: true, statusName: true } }
        },
    };

    const results = await db.query.employees.findMany(queryConfig);
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
 * @param companyId - The ID of the company the employee belongs to.
 * @param data - The updated data for the employee.
 * @returns The updated employee object or null if not found.
 */
export const updateEmployee = async (employeeId: number, companyId: number, data: Partial<typeof employees.$inferInsert>): Promise<EmployeeOrNull> => {
    const result = await db.update(employees)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(employees.id, employeeId), eq(employees.companyId, companyId) ))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a employee.
 * @param employeeId - The ID of the employee to delete.
 * @param companyId - The ID of the company the employee belongs to.
 * @returns The deleted employee object or null if not found.
 */
export const deleteEmployee = async (employeeId: number, companyId: number): Promise<EmployeeOrNull> => {
    const result = await db.delete(employees)
        .where(and(eq(employees.id, employeeId), eq(employees.companyId, companyId)))
        .returning() as Array<Employee>;
    
    return result.length > 0 ? result[0] : null;
};


/**
 * Evaluates the number of employees in a company.
 * @param companyId - The ID of the company to evaluate.
 * @returns The number of employees in the company.
 */
export const allowedToAddEmployee = async (companyId: number, numberOfEmployees: number = 10): Promise<boolean> => {
    const companyData = await db.query.company.findFirst({
        where: eq(company.id, companyId),
    });
    
    if(!companyData){
        return false;
    }

    console.log(companyData.subscriptionStatus);
    if(companyData.subscriptionStatus === 'active'){
        return true;
    }

    const result = await db.query.employees.findMany({
        where: eq(employees.companyId, companyId),
    });
    console.log(result.length);
    return result.length < numberOfEmployees;
};