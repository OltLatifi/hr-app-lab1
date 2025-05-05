import db from "../db";
import { trainingPrograms } from "../db/schema";
import { eq, and } from "drizzle-orm";

type TrainingProgram = typeof trainingPrograms.$inferSelect;
type TrainingProgramOrNull = TrainingProgram | null;

/**
 * Finds a training program by their ID and company ID.
 * @param trainingProgramId - The ID of the training program to find.
 * @param companyId - The ID of the company the training program belongs to.
 * @returns The training program object or null if not found.
 */
export const findTrainingProgramById = async (trainingProgramId: number, companyId: number): Promise<TrainingProgramOrNull> => {
    const result = await db.select()
    .from(trainingPrograms)
    .where(and(eq(trainingPrograms.id, trainingProgramId), eq(trainingPrograms.companyId, companyId)))
    .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all training programs for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all training program objects for the company.
 */
export const getAllTrainingPrograms = async (companyId: number): Promise<Array<TrainingProgram>> => {
    return await db.select().from(trainingPrograms).where(eq(trainingPrograms.companyId, companyId));
};

/**
 * Creates a new training program. Assumes companyId is included in the data.
 * @param data - The data for the new training program, including companyId.
 * @returns The newly created training program object.
 */
export const createTrainingProgram = async (data: typeof trainingPrograms.$inferInsert): Promise<TrainingProgram> => {
    const result = await db.insert(trainingPrograms).values(data).returning();
    return result[0];
};

/**
 * Updates an existing training program.
 * @param trainingProgramId - The ID of the training program to update.
 * @param companyId - The ID of the company the training program belongs to.
 * @param data - The updated data for the training program.
 * @returns The updated training program object or null if not found.
 */
export const updateTrainingProgram = async (trainingProgramId: number, companyId: number, data: Partial<typeof trainingPrograms.$inferInsert>): Promise<TrainingProgramOrNull> => {
    const result = await db.update(trainingPrograms)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(trainingPrograms.id, trainingProgramId), eq(trainingPrograms.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a training program.
 * @param trainingProgramId - The ID of the training program to delete.
 * @param companyId - The ID of the company the training program belongs to.
 * @returns The deleted training program object or null if not found.
 */
export const deleteTrainingProgram = async (trainingProgramId: number, companyId: number): Promise<TrainingProgramOrNull> => {
    const result = await db.delete(trainingPrograms)
        .where(and(eq(trainingPrograms.id, trainingProgramId), eq(trainingPrograms.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};
