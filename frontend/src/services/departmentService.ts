import apiClient from '@/lib/api-client';

export interface CreateDepartmentPayload {
    departmentName: string;
}

export interface DepartmentResponse {
    departmentId: number;
    departmentName: string;
    createdAt: string;
    updatedAt: string;
}

export const createDepartment = async (departmentData: CreateDepartmentPayload): Promise<DepartmentResponse> => {
    try {
        const response = await apiClient.post<DepartmentResponse>('/departments', departmentData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Department:', error);
        throw error; 
    }
}; 

export const deleteDepartment = async (departmentId: number): Promise<void> => {
    try {
        await apiClient.delete(`/departments/${departmentId}`);
    } catch (error) {
        console.error('API Error Deleting Department:', error);
        throw error;
    }
};  

export const getDepartments = async (): Promise<DepartmentResponse[]> => {
    try {
        const response = await apiClient.get<DepartmentResponse[]>('/departments');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Departments:', error);
        throw error;
    }
}; 

export const getDepartmentById = async (departmentId: number): Promise<DepartmentResponse> => {
    try {
        const response = await apiClient.get<DepartmentResponse>(`/departments/${departmentId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Department by ID:', error);
        throw error;
    }
}; 

export const updateDepartment = async (departmentId: number, departmentData: CreateDepartmentPayload): Promise<DepartmentResponse> => {
    try {
        const response = await apiClient.put<DepartmentResponse>(`/departments/${departmentId}`, departmentData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Department:', error);
        throw error;
    }
};