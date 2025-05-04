import apiClient from '../lib/api-client';
import { RegisterAdminFormValues } from '../pages/auth/register-page';
import { LoginFormValues } from '../pages/auth/login-page';
import { AxiosError } from 'axios';
import { Company } from '@/types/company';
import { User } from '@/types/user';
import { CompanyWithAdmin } from '@/types/company';

interface AuthResponse {
    message: string;
    user: User;
}

interface StatusResponse {
    user: User;
}

interface InviteResponse {
    message: string;
    invitationId: number;
}

interface ValidationResponse {
    message: string;
    email: string;
}

export const registerUser = async (userData: RegisterAdminFormValues): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>(`/auth/register`, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || 'Registration failed';
        console.error('Registration Error:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const loginUser = async (userData: LoginFormValues): Promise<AuthResponse> => {
    try {
        const response = await apiClient.post<AuthResponse>(`/auth/login`, {
            email: userData.email,
            password: userData.password,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || 'Login failed';
        console.error('Login Error:', errorMessage);
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

export const checkAuthStatus = async (): Promise<AuthResponse> => {
    try {
        const response = await apiClient.get<AuthResponse>(`/auth/status`);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || 'Failed to fetch auth status';
        console.error('Auth Status Error:', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
};

export const registerAdminUser = async (adminData: { name: string; password: string; token: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register-admin', adminData);
    return response.data;
};

export const validateInvitationToken = async (token: string): Promise<ValidationResponse> => {
    const response = await apiClient.get<ValidationResponse>(`/auth/invitations/validate/${token}`);
    return response.data;
};

export const inviteAdmin = async (inviteData: { companyId: number; invitedUserEmail: string }): Promise<InviteResponse> => {
    const response = await apiClient.post<InviteResponse>('/admin/invite', inviteData);
    return response.data;
};

export const fetchAuthStatus = async (): Promise<StatusResponse> => {
    const response = await apiClient.get<StatusResponse>('/auth/status');
    return response.data;
};

export const getAllCompanies = async (): Promise<CompanyWithAdmin[]> => {
    const response = await apiClient.get<CompanyWithAdmin[]>('/companies');
    return response.data;
};

export const createCompany = async (companyData: { name: string }): Promise<Company> => {
    const response = await apiClient.post<Company>('/companies', companyData);
    return response.data;
};

export const deleteCompany = async (companyId: number): Promise<void> => {
    const response = await apiClient.delete<void>(`/companies/${companyId}`);
    return response.data;
};