import apiClient from '@/lib/api-client';

export interface LeaveTypePayload {
    typeName: string;
}

export interface LeaveTypeResponse {
    id: number;
    typeName: string;
    createdAt: string;
    updatedAt: string;
}

export const createLeaveType = async (leaveTypeData: LeaveTypePayload): Promise<LeaveTypeResponse> => {
    try {
        const response = await apiClient.post<LeaveTypeResponse>('/leavetypes', leaveTypeData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Leave Type:', error);
        throw error; 
    }
}; 

export const deleteLeaveType = async (leaveTypeId: number): Promise<void> => {
    try {
        await apiClient.delete(`/leavetypes/${leaveTypeId}`);
    } catch (error) {
        console.error('API Error Deleting Leave Type:', error);
        throw error;
    }
};  

export const getLeaveTypes = async (): Promise<LeaveTypeResponse[]> => {
    try {
        const response = await apiClient.get<LeaveTypeResponse[]>('/leavetypes');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Leave Types:', error);
        throw error;
    }
}; 

export const getLeaveTypeById = async (leaveTypeId: number): Promise<LeaveTypeResponse> => {
    try {
        const response = await apiClient.get<LeaveTypeResponse>(`/leavetypes/${leaveTypeId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Leave Type by ID:', error);
        throw error;
    }
}; 

export const updateLeaveType = async (leaveTypeId: number, leaveTypeData: LeaveTypePayload): Promise<LeaveTypeResponse> => {
    try {
        const response = await apiClient.put<LeaveTypeResponse>(`/leavetypes/${leaveTypeId}`, leaveTypeData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Leave Type:', error);
        throw error;
    }
};