import 'dotenv/config'; // Ensure environment variables are loaded

// TODO: Replace placeholders with strong, random secrets stored in environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'YOUR_VERY_SECRET_ACCESS_KEY_PLACEHOLDER';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'YOUR_VERY_SECRET_REFRESH_KEY_PLACEHOLDER';

const ACCESS_TOKEN_EXPIRATION = 15 * 60; // 900 seconds = 15 minutes
const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 604800 seconds = 7 days

// Cookie names
const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const authConfig = {
    secrets: {
        access: ACCESS_TOKEN_SECRET,
        refresh: REFRESH_TOKEN_SECRET,
    },
    expiration: {
        access: ACCESS_TOKEN_EXPIRATION,
        refresh: REFRESH_TOKEN_EXPIRATION,
    },
    cookies: {
        access: ACCESS_TOKEN_COOKIE_NAME,
        refresh: REFRESH_TOKEN_COOKIE_NAME,
    }
};

// Basic validation to ensure secrets are not left as placeholders in production
if (process.env.NODE_ENV === 'production' &&
    (ACCESS_TOKEN_SECRET === 'YOUR_VERY_SECRET_ACCESS_KEY_PLACEHOLDER' ||
     REFRESH_TOKEN_SECRET === 'YOUR_VERY_SECRET_REFRESH_KEY_PLACEHOLDER')) {
    console.error('FATAL ERROR: JWT secrets are not set in environment variables for production!');
    process.exit(1);
} 