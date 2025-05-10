import db from "../db";
import { payroll } from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

type Payroll = typeof payroll.$inferSelect;
type PayrollOrNull = Payroll | null;

/**
 * Finds a payroll by their ID and company ID.
 * @param payrollId - The ID of the payroll to find.
 * @param companyId - The ID of the company the payroll belongs to.
 * @returns The payroll object or null if not found.
 */
export const findPayrollById = async (payrollId: number, companyId: number): Promise<PayrollOrNull> => {
    const result = await db.select()
    .from(payroll)
    .where(and(eq(payroll.id, payrollId), eq(payroll.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all payrolls for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all payroll objects for the company.
 */
export const getAllPayrolls = async (companyId: number): Promise<Array<Payroll>> => {
    const results = await db.query.payroll.findMany({
        where: eq(payroll.companyId, companyId),
        with: {
            employee: true,
        },
    });
    return results;
};

/**
 * Creates a new payroll. Assumes companyId is included in the data.
 * @param data - The data for the new payroll, including companyId.
 * @returns The newly created payroll object.
 */
export const createPayroll = async (data: typeof payroll.$inferInsert): Promise<Payroll> => {
    const result = await db.insert(payroll).values(data).returning();
    return result[0];
};

/**
 * Updates an existing payroll.
 * @param payrollId - The ID of the payroll to update.
 * @param companyId - The ID of the company the payroll belongs to.
 * @param data - The updated data for the payroll.
 * @returns The updated payroll object or null if not found.
 */
export const updatePayroll = async (payrollId: number, companyId: number, data: Partial<typeof payroll.$inferInsert>): Promise<PayrollOrNull> => {
    const result = await db.update(payroll)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(payroll.id, payrollId), eq(payroll.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a payroll.
 * @param payrollId - The ID of the payroll to delete.
 * @param companyId - The ID of the company the payroll belongs to.
 * @returns The deleted payroll object or null if not found.
 */
export const deletePayroll = async (payrollId: number, companyId: number): Promise<PayrollOrNull> => {
    const result = await db.delete(payroll)
        .where(and(eq(payroll.id, payrollId), eq(payroll.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};

/**
 * Calculates payrolls by month for a specific company.
 * @param companyId - The ID of the company.
 * @returns A record of the total gross pay for each month.
 */
export const calculatePayrollsByMonth = async (companyId: number): Promise<Record<number, number>> => {
    const results = await db.query.payroll.findMany({
        where: eq(payroll.companyId, companyId),
    });

    const payrollsByMonth: Record<number, number> = {};

    results.forEach((curr) => {
        const start = new Date(curr.payPeriodStartDate);
        const end = new Date(curr.payPeriodEndDate);
        let current = new Date(start);

        while (current <= end) {
            const month = current.getMonth();
            payrollsByMonth[month] = (payrollsByMonth[month] || 0) + curr.grossPay;
            current.setMonth(current.getMonth() + 1, 1);
        }
    });

    return payrollsByMonth;
};
