import db from "../db";
import { jobTitles } from "../db/schema";
import { eq, and } from "drizzle-orm";

type JobTitle = typeof jobTitles.$inferSelect;
type JobTitleOrNull = JobTitle | null;

/**
 * Finds a job title by their ID.
 * @param jobTitleId - The ID of the job title to find.
 * @param companyId - The ID of the company the job title belongs to.
 * @returns The job title object or null if not found.
 */
export const findJobTitleById = async (jobTitleId: number, companyId: number): Promise<JobTitleOrNull> => {
    const result = await db.select()
    .from(jobTitles)
    .where(and(eq(jobTitles.id, jobTitleId), eq(jobTitles.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all job titles.
 * @param companyId - The ID of the company.
 * @returns A list of all job title objects for the company.
 */
export const getAllJobTitles = async (companyId: number): Promise<Array<JobTitle>> => {
    return await db.select().from(jobTitles).where(eq(jobTitles.companyId, companyId));
};

/**
 * Creates a new job title.
 * @param data - The data for the new job title.
 * @returns The newly created job title object.
 */
export const createJobTitle = async (data: typeof jobTitles.$inferInsert): Promise<JobTitle> => {
    const result = await db.insert(jobTitles).values(data).returning();
    return result[0];
};

/**
 * Updates an existing job title.
 * @param jobTitleId - The ID of the job title to update.
 * @param companyId - The ID of the company the job title belongs to.
 * @param data - The updated data for the job title.
 * @returns The updated job title object or null if not found.
 */
export const updateJobTitle = async (jobTitleId: number, companyId: number, data: Partial<typeof jobTitles.$inferInsert>): Promise<JobTitleOrNull> => {
    const result = await db.update(jobTitles)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(jobTitles.id, jobTitleId), eq(jobTitles.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a job title.
 * @param jobTitleId - The ID of the job title to delete.
 * @param companyId - The ID of the company the job title belongs to.
 * @returns The deleted job title object or null if not found.
 */
export const deleteJobTitle = async (jobTitleId: number, companyId: number): Promise<JobTitleOrNull> => {
    const result = await db.delete(jobTitles)
        .where(and(eq(jobTitles.id, jobTitleId), eq(jobTitles.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
