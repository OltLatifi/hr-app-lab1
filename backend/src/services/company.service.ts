import db from '../db';
import { company } from '../db/schema';
import { eq } from 'drizzle-orm';

type CreatedCompany = typeof company.$inferSelect;

/**
 * Updates the admin user for a specific company.
 * @param companyId The ID of the company to update.
 * @param adminId The ID of the new admin user.
 * @returns The updated company record.
 * @throws Error if the company cannot be found or updated.
 */
export const updateCompanyAdmin = async (companyId: number, adminId: number) => {
    try {
        const [updatedCompany] = await db
            .update(company)
            .set({ adminId: adminId, updatedAt: new Date() })
            .where(eq(company.id, companyId))
            .returning();

        if (!updatedCompany) {
            throw new Error('Company not found or could not be updated.');
        }
        return updatedCompany;
    } catch (error) {
        console.error('Error updating company admin:', error);
        throw new Error('Database error during company admin update.');
    }
}; 

/**
 * Finds a company by its ID.
 * @param companyId The ID of the company to find.
 * @returns The company record or null if not found.
 */
export const findCompanyById = async (companyId: number) => {
    const result = await db
        .select()
        .from(company)
        .where(eq(company.id, companyId));
    return result.length > 0 ? result[0] : null;
};

/**
 * Finds all companies.
 * @returns An array of all company records.
 */
export const findAllCompanies = async () => {
    const companies = await db.query.company.findMany({
        with: {
            admin: true,
        },
    });
    return companies;
};

/**
 * Creates a new company.
 * @param name The name of the new company.
 * @param adminId The ID of the user who will administer this company.
 * @returns The newly created company record.
 * @throws Error if the company cannot be created.
 */
export const createCompany = async (name: string): Promise<CreatedCompany> => {
    try {
        const [newCompany] = await db
            .insert(company)
            .values({ name })
            .returning();

        if (!newCompany) {
            throw new Error('Failed to create company.');
        }
        return newCompany;
    } catch (error) {
        console.error('Error creating company:', error);
        throw new Error('Database error during company creation.');
    }
};

/**
 * Deletes a company by its ID.
 * @param companyId The ID of the company to delete.
 * @returns The deleted company record or null if not found.
 */
export const deleteCompany = async (companyId: number) => {
    try {
        const result = await db
            .delete(company)
            .where(eq(company.id, companyId))
            .returning();

        if (!result) {
            throw new Error('Company not found or could not be deleted.');
        }
        return result[0];
    } catch (error) {
        console.error('Error deleting company:', error);
        throw new Error('Database error during company deletion.');
    }
};  