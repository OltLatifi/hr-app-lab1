import db from '../db';
import { users, User, roles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils/auth.utils';
/**
 * Finds a user by their ID, including the ID of the company they administer.
 * Excludes the password field from the result.
 * @param userId - The ID of the user to find.
 * @returns The user object with companyId or null if not found.
 */
export const findUserById = async (userId: number) => {
    const result = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            name: true,
            email: true,
        },
        with: {
            administeredCompany: {
                columns: {
                    id: true
                }
            },
            role: true,
        }
    });

    if (!result) {
        return null;
    }

    const userWithCompanyId = {
        id: result.id,
        name: result.name,
        email: result.email,
        roleId: result.role.id,
        companyId: result.administeredCompany?.id ?? null,
        role: result.role,
    };

    return userWithCompanyId;
};

/**
 * Finds a user by their email.
 * Includes the password field for authentication purposes.
 * @param email - The email of the user to find.
 * @returns The full user object (including password hash) or null if not found.
 */
export const findUserByEmailWithPassword = async (email: string) => {
    const result = await db.query.users.findFirst({
        where: eq(users.email, email),
        with: {
            role: true,
        },
    });

    return result ?? null;
};

/**
 * Creates a new user in the database.
 * @param name - The name of the user.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @param roleId - The role ID of the user.
 * @returns The newly created user.
 */
export const createUser = async (name: string, email: string, password: string, role: string): Promise<User> => {
    const hashedPassword = await hashPassword(password);
    const roleId = await db.query.roles.findFirst({ where: eq(roles.name, role) });
    if (!roleId) {
        throw new Error('Role not found');
    }
    const newUser = await db.insert(users).values({ name, email, password: hashedPassword, roleId: roleId.id }).returning();
    return newUser[0] as User;
};