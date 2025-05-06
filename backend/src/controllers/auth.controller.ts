import { Request, Response } from 'express';
import {
    generateAccessToken,
    generateRefreshToken,
    comparePassword,
    verifyRefreshToken,
    AuthTokenPayload
} from '../utils/auth.utils';
import { createUser, findUserByEmailWithPassword } from '../services/user.service';
import { authConfig } from '../config/auth.config';
import {
    findValidInvitationByToken,
    markInvitationAsAccepted
} from '../services/invitation.service';
import { updateCompanyAdmin } from '../services/company.service';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie(authConfig.cookies.access, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: authConfig.expiration.access * 1000,
    });
    res.cookie(authConfig.cookies.refresh, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: authConfig.expiration.refresh * 1000,
    });
};

export const getStatus = (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated (status check).' });
    }
    res.status(200).json({ user: req.user });
};

export const login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await findUserByEmailWithPassword(email);

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const tokenPayload: AuthTokenPayload = { userId: user.id };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
};

export const refresh = async (req: Request, res: Response): Promise<Response> => {
    logging.log('THIS ENDPOINT IS BEING CALLED');
    logging.log(req.cookies);
    const existingRefreshToken = req.cookies[authConfig.cookies.refresh];

    if (!existingRefreshToken) {
        return res.status(401).json({ message: 'Refresh token not found.' });
    }

    const payload = verifyRefreshToken(existingRefreshToken);

    if (!payload) {
        res.clearCookie(authConfig.cookies.refresh, { path: '/api/auth/refresh' }); 
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }

    try {
        const newAccessTokenPayload: AuthTokenPayload = { userId: payload.userId };
        const newAccessToken = generateAccessToken(newAccessTokenPayload);
        
        // Rotating refresh token
        const newRefreshToken = generateRefreshToken(newAccessTokenPayload);
        setAuthCookies(res, newAccessToken, newRefreshToken);
        
        return res.status(200).json({ message: 'Access token refreshed successfully.'});

    } catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({ message: 'Internal server error during token refresh.' });
    }
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie(authConfig.cookies.access, { path: '/' });
    res.clearCookie(authConfig.cookies.refresh, { path: '/api/auth/refresh' });

    res.status(204).send();
};

export const register = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const existingUser = await findUserByEmailWithPassword(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const newUser = await createUser(name, email, password);

        const tokenPayload: AuthTokenPayload = { userId: newUser.id };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(201).json({ 
            message: 'Registration successful', 
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

export const validateInvitation = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ message: 'Invitation token is required.' });
    }

    try {
        const invitation = await findValidInvitationByToken(token);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation is invalid, expired, or already used.' });
        }

        return res.status(200).json({ 
            message: 'Invitation is valid.', 
            email: invitation.invitedUserEmail 
        });

    } catch (error) {
        console.error('Error validating invitation token:', error);
        return res.status(500).json({ message: 'Internal server error during token validation.' });
    }
};


export const registerAdmin = async (req: Request, res: Response): Promise<Response> => {
    const { name, password, token } = req.body;

    if (!name || !password || !token) {
        return res.status(400).json({ message: 'Name, password, and invitation token are required.' });
    }

    try {
        const invitation = await findValidInvitationByToken(token);
        if (!invitation) {
            return res.status(400).json({ message: 'Invalid or expired invitation token.' });
        }

        const existingUser = await findUserByEmailWithPassword(invitation.invitedUserEmail);
        if (existingUser) {
            return res.status(409).json({ message: 'Email associated with this invitation is already registered.' });
        }

        const newUser = await createUser(name, invitation.invitedUserEmail, password);

        await updateCompanyAdmin(invitation.companyId, newUser.id);

        await markInvitationAsAccepted(token);

        const tokenPayload: AuthTokenPayload = { userId: newUser.id };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        setAuthCookies(res, accessToken, refreshToken);

        return res.status(201).json({ 
            message: 'Admin registration successful', 
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        return res.status(500).json({ message: 'Internal server error during admin registration.' });
    }
};