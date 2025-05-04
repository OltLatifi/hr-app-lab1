import db from '../db';
import { adminInvitations } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { addHours } from 'date-fns';

const INVITATION_EXPIRATION_HOURS = 24;

/**
 * Generates a secure random token.
 * @returns A unique invitation token.
 */
const generateInvitationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Creates a new admin invitation record in the database.
 * @param invitedUserEmail The email of the user being invited.
 * @param companyId The ID of the company the user is being invited to administer.
 * @param invitedById The ID of the user sending the invitation.
 * @returns The newly created invitation record.
 * @throws Error if the invitation cannot be created.
 */
export const createAdminInvitation = async (
    invitedUserEmail: string,
    companyId: number,
    invitedById: number
) => {
    const invitationToken = generateInvitationToken();
    const expiresAt = addHours(new Date(), INVITATION_EXPIRATION_HOURS);

    try {
        const [newInvitation] = await db
            .insert(adminInvitations)
            .values({
                companyId,
                invitedUserEmail,
                invitationToken,
                expiresAt,
                invitedById,
                status: 'pending',
            })
            .returning();

        if (!newInvitation) {
            throw new Error('Failed to create admin invitation.');
        }
        return newInvitation;
    } catch (error) {
        console.error('Error creating admin invitation:', error);
        throw new Error('Database error during invitation creation.');
    }
};

/**
 * Finds a valid admin invitation by its token.
 * Checks if the token exists, is not expired, and is pending.
 * @param token The invitation token.
 * @returns The invitation record if valid, otherwise null.
 */
export const findValidInvitationByToken = async (token: string) => {
    try {
        const [invitation] = await db
            .select()
            .from(adminInvitations)
            .where(eq(adminInvitations.invitationToken, token));

        if (!invitation) {
            return null;
        }

        if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
            return null;
        }

        return invitation;
    } catch (error) {
        console.error('Error finding invitation by token:', error);
        return null;
    }
};

/**
 * Marks an admin invitation as 'accepted'.
 * @param token The invitation token.
 * @returns The updated invitation record.
 * @throws Error if the invitation cannot be found or updated.
 */
export const markInvitationAsAccepted = async (token: string) => {
     try {
        const [updatedInvitation] = await db
            .update(adminInvitations)
            .set({ status: 'accepted', updatedAt: new Date() })
            .where(eq(adminInvitations.invitationToken, token))
            .returning();

        if (!updatedInvitation) {
             throw new Error('Invitation not found or could not be updated.');
        }
        return updatedInvitation;
     } catch (error) {
         console.error('Error marking invitation as accepted:', error);
         throw new Error('Database error during invitation update.');
     }
}; 