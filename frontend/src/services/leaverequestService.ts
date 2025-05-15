import apiClient from '@/lib/api-client';

export interface CreateLeaveRequestPayload {
    employeeId?: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    status: string;
}

export const createLeaveRequest = async (data: Omit<CreateLeaveRequestPayload, 'employeeId'>) => {
    const response = await apiClient.post('/leaverequests', data);
    return response.data;
};

export const getleaves = async () => {
    const response = await apiClient.get('/leaverequests');
    return response.data;
};

export const getLeaveRequestById = async (id: number) => {
    const response = await apiClient.get(`/leaverequests/${id}`);
    return response.data;
};

export const updateLeaveRequest = async (id: number, data: Partial<CreateLeaveRequestPayload>) => {
    const response = await apiClient.put(`/leaverequests/${id}`, data);
    return response.data;
};

export const deleteLeaveRequest = async (id: number) => {
    const response = await apiClient.delete(`/leaverequests/${id}`);
    return response.data;
}; 