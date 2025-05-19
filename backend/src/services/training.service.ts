import db from "../db";
import { trainingPrograms, employeeTraining } from "../db/schema";
import { eq, and } from "drizzle-orm";

export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type NewTrainingProgram = typeof trainingPrograms.$inferInsert;
export type TrainingProgramOrNull = TrainingProgram | null;

export type EmployeeTraining = typeof employeeTraining.$inferSelect;
export type NewEmployeeTraining = typeof employeeTraining.$inferInsert;
export type EmployeeTrainingOrNull = EmployeeTraining | null;

/**
 * Finds a training program by their ID and company ID.
 * @param trainingId - The ID of the training program to find.
 * @param companyId - The ID of the company the training program belongs to.
 * @returns The training program object or null if not found.
 */
export const findTrainingById = async (trainingId: number, companyId: number): Promise<TrainingProgramOrNull> => {
    const result = await db.query.trainingPrograms.findFirst({
        where: and(eq(trainingPrograms.id, trainingId), eq(trainingPrograms.companyId, companyId))
    });
    return result || null;
};

/**
 * Retrieves all training programs for a specific company.
 * @param companyId - The ID of the company.
 * @returns A list of all training program objects for the company.
 */
export const getAllTrainings = async (companyId: number): Promise<Array<TrainingProgram>> => {
    return await db.query.trainingPrograms.findMany({
        where: eq(trainingPrograms.companyId, companyId)
    });
};

/**
 * Retrieves all training programs for a specific employee.
 * @param employeeId - The ID of the employee.
 * @param companyId - The ID of the company.
 * @returns A list of all training programs for the employee.
 */
export const getEmployeeTrainings = async (employeeId: number, companyId: number): Promise<Array<EmployeeTraining>> => {
    return await db.query.employeeTraining.findMany({
        where: and(
            eq(employeeTraining.employeeId, employeeId)
        ),
        with: {
            trainingProgram: true
        }
    }).then(trainings => 
        trainings.filter(training => training.trainingProgram.companyId === companyId)
    );
};

/**
 * Creates a new training program. Assumes companyId is included in the data.
 * @param data - The data for the new training program, including companyId.
 * @returns The newly created training program object.
 */
export const createTraining = async (data: NewTrainingProgram): Promise<TrainingProgram> => {
    const result = await db.insert(trainingPrograms).values(data).returning();
    return result[0];
};

/**
 * Updates an existing training program.
 * @param trainingId - The ID of the training program to update.
 * @param companyId - The ID of the company the training program belongs to.
 * @param data - The updated data for the training program.
 * @returns The updated training program object or null if not found.
 */
export const updateTraining = async (trainingId: number, companyId: number, data: Partial<NewTrainingProgram>): Promise<TrainingProgramOrNull> => {
    const result = await db.update(trainingPrograms)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(trainingPrograms.id, trainingId), eq(trainingPrograms.companyId, companyId)))
        .returning();

    return result.length > 0 ? result[0] : null;
};

/**
 * Deletes a training program.
 * @param trainingId - The ID of the training program to delete.
 * @param companyId - The ID of the company the training program belongs to.
 * @returns The deleted training program object or null if not found.
 */
export const deleteTraining = async (trainingId: number, companyId: number): Promise<TrainingProgramOrNull> => {
    const result = await db.delete(trainingPrograms)
        .where(and(eq(trainingPrograms.id, trainingId), eq(trainingPrograms.companyId, companyId)))
        .returning();
    
    return result.length > 0 ? result[0] : null;
};

/**
 * Assigns a training program to an employee.
 * @param data - The data for the new employee training assignment, including employeeId and trainingId.
 * @returns The newly created employee training assignment object.
 */
export const assignTraining = async (data: NewEmployeeTraining): Promise<EmployeeTraining> => {
    const result = await db.insert(employeeTraining).values(data).returning();
    const training = await db.query.employeeTraining.findFirst({
        where: eq(employeeTraining.employeeTrainingId, result[0].employeeTrainingId),
        with: {
            trainingProgram: { columns: { id: true, name: true } }
        }
    });
    return training!;
};

/**
 * Removes a training program from an employee's training assignments.
 * @param employeeId - The ID of the employee.
 * @param trainingId - The ID of the training program.
 */
export const removeTraining = async (employeeId: number, trainingId: number): Promise<void> => {
    await db.delete(employeeTraining)
        .where(
            and(
                eq(employeeTraining.employeeId, employeeId),
                eq(employeeTraining.programId, trainingId)
            )
        );
};
