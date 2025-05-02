import db from '../db';
import { users, User } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils/auth.utils';

/**
 * Finds a user by their ID.
 * Excludes the password field from the result.
 * @param userId - The ID of the user to find.
 * @returns The user object or null if not found.
 */
export const findUserById = async (userId: number): Promise<User | null> => {
    const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    return result.length > 0 ? result[0] as User : null;
};

/**
 * Finds a user by their email.
 * Includes the password field for authentication purposes.
 * @param email - The email of the user to find.
 * @returns The full user object (including password hash) or null if not found.
 */
export const findUserByEmailWithPassword = async (email: string): Promise<typeof users.$inferSelect | null> => {
    const result = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return result.length > 0 ? result[0] : null;
};

/**
 * Creates a new user in the database.
 * @param name - The name of the user.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns The newly created user.
 */
export const createUser = async (name: string, email: string, password: string): Promise<User> => {
    const hashedPassword = await hashPassword(password);
    const newUser = await db.insert(users).values({ name, email, password: hashedPassword }).returning();
    return newUser[0] as User;
};