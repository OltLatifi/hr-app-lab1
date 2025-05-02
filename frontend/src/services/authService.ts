import apiClient from '../lib/api-client';
import { RegisterFormValues } from '../pages/auth/register-page';
import { LoginFormValues } from '../pages/auth/login-page';
import { AxiosError } from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthSuccessResponse {
    user: User; 
    token: string;
}

interface ApiErrorResponse {
    message: string;
}


export const registerUser = async (userData: RegisterFormValues): Promise<AuthSuccessResponse> => {
    try {
        const response = await apiClient.post<AuthSuccessResponse>(`/auth/register`, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Registration failed';
        throw new Error(errorMessage);
    }
};

export const loginUser = async (userData: LoginFormValues): Promise<AuthSuccessResponse> => {
    try {
        const response = await apiClient.post<AuthSuccessResponse>(`/auth/login`, {
            email: userData.email,
            password: userData.password,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Login failed';
        throw new Error(errorMessage);
    }
}; 

export const logoutUser = async (): Promise<void> => {
    try {
        await apiClient.post(`/auth/logout`);
    } catch (error) {
        console.error('Logout failed:', error);

        throw new Error('Logout failed');
    }
};

export const checkAuthStatus = async (): Promise<AuthSuccessResponse> => {
    try {
        const response = await apiClient.get<AuthSuccessResponse>(`/auth/status`);
        return response.data;
    } catch (error) {
        console.error('Check auth status failed:', error);
        throw new Error('Check auth status failed');
    }
};