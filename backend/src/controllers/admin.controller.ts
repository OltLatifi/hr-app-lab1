import { Request, Response } from 'express';
import { createInvitation } from '../services/invitation.service';
import { findCompanyById } from '../services/company.service';
import { sendEmail } from '../utils/email.utils';

export const inviteAdmin = async (req: Request, res: Response): Promise<Response> => {
    const { companyId, invitedUserEmail } = req.body;
    const inviterUser = req.user;

    if (!inviterUser || !inviterUser.id || !inviterUser.email) {
        return res.status(401).json({ message: 'Unauthorized: Invalid authentication data.' });
    }

    if (inviterUser.role.name !== 'Admin') {
        console.warn(`Unauthorized invite attempt by user: ${inviterUser.email} (ID: ${inviterUser.id})`);
        return res.status(403).json({ message: 'Forbidden: You do not have permission to invite admins.' });
    }

    if (!companyId || !invitedUserEmail) {
        return res.status(400).json({ message: 'Company ID and invited user email are required.' });
    }

    try {
        const company = await findCompanyById(companyId);
        if (!company) { 
            return res.status(404).json({ message: 'Company not found.' });
        }
        const companyName = company.name;

        const invitation = await createInvitation(
            invitedUserEmail,
            companyId,
            inviterUser.id,
            'HR'
        );

        sendEmail(
            invitedUserEmail,
            "HR Management System - Admin Invitation",
            `<p>You have been invited to join ${companyName} as an admin. Please click the link below to register:</p><p><a href="http://localhost:5173/register?token=${invitation.invitationToken}">Register</a></p>`
        );

        return res.status(201).json({ 
            message: 'Admin invitation sent successfully.',
            invitationId: invitation.id 
        });

    } catch (error) {
        console.error('Error sending admin invitation:', error);
        if (error instanceof Error && error.message.includes('Database error')) {
            return res.status(500).json({ message: 'Database error during invitation creation.' });
        }
        return res.status(500).json({ message: 'Internal server error sending invitation.' });
    }
}; 