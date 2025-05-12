import apiClient from '@/lib/api-client';
import { DepartmentResponse } from './departmentService';

export interface CreatePayLimitPayload {
    departmentId: number;
    limit: number;
}

export interface PayLimitResponse {
    id: number;
    limit: number;
    departmentId: number;
    department: DepartmentResponse;
    createdAt: string;
    updatedAt: string;
}

export const createPayLimit = async (payLimitData: CreatePayLimitPayload): Promise<PayLimitResponse> => {
    try {
        const response = await apiClient.post<PayLimitResponse>('/paylimits', payLimitData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Pay Limit:', error);
        throw error; 
    }
}; 

export const deletePayLimit = async (payLimitId: number): Promise<void> => {
    try {   
        await apiClient.delete(`/paylimits/${payLimitId}`);
    } catch (error) {
        console.error('API Error Deleting Pay Limit:', error);
        throw error;
    }
};  

export const getPayLimits = async (): Promise<PayLimitResponse[]> => {
    try {
        const response = await apiClient.get<PayLimitResponse[]>('/paylimits');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Pay Limits:', error);
        throw error;
    }
}; 

export const getPayLimitById = async (payLimitId: number): Promise<PayLimitResponse> => {
    try {
        const response = await apiClient.get<PayLimitResponse>(`/paylimits/${payLimitId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Pay Limit by ID:', error);
        throw error;
    }
}; 

export const getPayLimitByDepartmentId = async (departmentId: number): Promise<PayLimitResponse> => {
    try {
        const response = await apiClient.get<PayLimitResponse>(`/paylimits/department/${departmentId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Pay Limit by ID:', error);
        throw error;
    }
}; 

export const updatePayLimit = async (payLimitId: number, payLimitData: CreatePayLimitPayload): Promise<PayLimitResponse> => {
    try {
        const response = await apiClient.put<PayLimitResponse>(`/paylimits/${payLimitId}`, payLimitData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Pay Limit:', error);
        throw error;
    }
};