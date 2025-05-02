import express, { Request, Response, Router } from 'express';
import { 
    generateAccessToken, 
    generateRefreshToken, 
    comparePassword, 
    verifyRefreshToken,
    AuthTokenPayload
} from '../utils/auth.utils';
import { createUser, findUserByEmailWithPassword } from '../services/user.service';
import { authConfig } from '../config/auth.config';
import { authenticateToken } from '../middleware/auth.middleware';

const authRouter: Router = express.Router();

// --- Helper Function to Set Cookies ---
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    // Set access token cookie
    res.cookie(authConfig.cookies.access, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: authConfig.expiration.access * 1000,
    });

    // Set refresh token cookie
    res.cookie(authConfig.cookies.refresh, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge: authConfig.expiration.refresh * 1000,
    });
};

// --- Status Route ---
authRouter.get('/status', authenticateToken, (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated (status check).' });
    }
    res.status(200).json({ user: req.user });
});

// --- Login Route ---
authRouter.post('/login', async (req: Request, res: Response) => {
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

        res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

// --- Refresh Token Route ---
authRouter.post('/refresh', async (req: Request, res: Response) => {
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

        const newRefreshToken = generateRefreshToken(newAccessTokenPayload);
        setAuthCookies(res, newAccessToken, newRefreshToken);
        
        res.status(200).json({ message: 'Access token refreshed successfully.'});

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ message: 'Internal server error during token refresh.' });
    }
});

// --- Logout Route ---
authRouter.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie(authConfig.cookies.access, { path: '/' });
    res.clearCookie(authConfig.cookies.refresh, { path: '/api/auth/refresh' });

    res.status(204).send();
});

authRouter.post("/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await findUserByEmailWithPassword(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const newUser = await createUser(name, email, password);

        const tokenPayload: AuthTokenPayload = { userId: newUser.id };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        setAuthCookies(res, accessToken, refreshToken);

        res.status(201).json({ 
            message: 'Registration successful', 
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

export default authRouter; 