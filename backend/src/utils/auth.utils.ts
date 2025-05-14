import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authConfig } from '../config/auth.config';

const SALT_ROUNDS = 10;

export interface AuthTokenPayload {
    userId: number;
}

const accessTokenOptions: SignOptions = {
    expiresIn: authConfig.expiration.access,
};

const refreshTokenOptions: SignOptions = {
    expiresIn: authConfig.expiration.refresh,
};

export const generateAccessToken = (payloadData: { userId: number }): string => {
    const payload: AuthTokenPayload = { userId: payloadData.userId };
    return jwt.sign(payload, authConfig.secrets.access, accessTokenOptions);
};

export const generateRefreshToken = (payloadData: { userId: number }): string => {
    const payload: AuthTokenPayload = { userId: payloadData.userId };
    return jwt.sign(payload, authConfig.secrets.refresh, refreshTokenOptions);
};

export const verifyAccessToken = (token: string): AuthTokenPayload | null => {
    try {
        const decoded = jwt.verify(token, authConfig.secrets.access);
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && typeof decoded.userId === 'number') {
            return decoded as AuthTokenPayload;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string): AuthTokenPayload | null => {
    try {
        const decoded = jwt.verify(token, authConfig.secrets.refresh);
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && typeof decoded.userId === 'number') {
            return decoded as AuthTokenPayload;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
}; 2