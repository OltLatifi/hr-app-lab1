import apiClient from '@/lib/api-client';

export interface CreateEmploymentStatusPayload {
    statusName: string;
}

export interface EmploymentStatusResponse {
    id: number;
    statusName: string;
    createdAt: string;
    updatedAt: string;
}

export const createEmploymentStatus = async (employmentStatusData: CreateEmploymentStatusPayload): Promise<EmploymentStatusResponse> => {
    try {
        const response = await apiClient.post<EmploymentStatusResponse>('/employmentstatuses', employmentStatusData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Employment Status:', error);
        throw error; 
    }
}; 

export const deleteEmploymentStatus = async (employmentStatusId: number): Promise<void> => {
    try {
        await apiClient.delete(`/employmentstatuses/${employmentStatusId}`);
    } catch (error) {
        console.error('API Error Deleting Employment Status:', error);
        throw error;
    }
};  

export const getEmploymentStatuses = async (): Promise<EmploymentStatusResponse[]> => {
    try {
        const response = await apiClient.get<EmploymentStatusResponse[]>('/employmentstatuses');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Employment Statuses:', error);
        throw error;
    }
}; 

export const getEmploymentStatusById = async (employmentStatusId: number): Promise<EmploymentStatusResponse> => {
    try {
        const response = await apiClient.get<EmploymentStatusResponse>(`/employmentstatuses/${employmentStatusId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Employment Status by ID:', error);
        throw error;
    }
}; 

export const updateEmploymentStatus = async (employmentStatusId: number, employmentStatusData: CreateEmploymentStatusPayload): Promise<EmploymentStatusResponse> => {
    try {
        const response = await apiClient.put<EmploymentStatusResponse>(`/employmentstatuses/${employmentStatusId}`, employmentStatusData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Employment Status:', error);
        throw error;
    }
};