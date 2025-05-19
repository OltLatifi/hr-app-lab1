import db from '../db';
import { benefits, employeeBenefits } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';

export type Benefit = typeof benefits.$inferSelect;
export type NewBenefit = typeof benefits.$inferInsert;
export type BenefitOrNull = Benefit | null;

export type EmployeeBenefit = typeof employeeBenefits.$inferSelect;
export type NewEmployeeBenefit = typeof employeeBenefits.$inferInsert;
export type EmployeeBenefitOrNull = EmployeeBenefit | null;

/**
 * Finds a benefit by their ID and company ID.
 * @param benefitId - The ID of the benefit to find.
 * @param companyId - The ID of the company the benefit belongs to.
 * @returns The benefit object or null if not found.
 */
export const findBenefitById = async (benefitId: number, companyId: number): Promise<BenefitOrNull> => {
    const result = await db.query.benefits.findFirst({
        where: and(eq(benefits.id, benefitId), eq(benefits.companyId, companyId))
    });
    return result || null;
};

/**
 * Retrieves all benefits for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all benefit objects for the company.
 */
export const getAllBenefits = async (companyId: number): Promise<Array<Benefit>> => {
    return await db.query.benefits.findMany({
        where: eq(benefits.companyId, companyId)
    });
};

/**
 * Retrieves all employee benefits for a specific employee and company.
 * @param employeeId - The ID of the employee.
 * @param companyId - The ID of the company.
 * @returns A list of all employee benefit objects for the employee.
 */
export const getEmployeeBenefits = async (employeeId: number, companyId: number): Promise<Array<EmployeeBenefit>> => {
    return await db.query.employeeBenefits.findMany({
        where: and(
            eq(employeeBenefits.employeeId, employeeId),
            eq(employeeBenefits.companyId, companyId)
        ),
        with: {
            benefit: true
        }
    });
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

/**
 * Assigns a benefit to an employee.
 * @param data - The data for the new employee benefit, including employeeId and companyId.
 * @returns The newly created employee benefit object.
 */
export const assignBenefit = async (data: NewEmployeeBenefit): Promise<EmployeeBenefit> => {
    const result = await db.insert(employeeBenefits)
        .values(data)
        .returning();
    return result[0];
};

export const removeBenefit = async (employeeId: number, benefitId: number, companyId: number): Promise<void> => {
    await db.delete(employeeBenefits)
        .where(
            and(
                eq(employeeBenefits.employeeId, employeeId),
                eq(employeeBenefits.benefitId, benefitId),
                eq(employeeBenefits.companyId, companyId)
            )
        );
};
