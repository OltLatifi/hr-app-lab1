import apiClient from '@/lib/api-client';

export interface CreateTrainingPayload {
    name: string;
}

export interface TrainingResponse {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeTrainingResponse {
    employeeTrainingId: number;
    employeeId: number;
    programId: number;
    completionDate: string | null;
    createdAt: string;
    updatedAt: string;
    trainingProgram: TrainingResponse;
}

export interface AssignTrainingPayload {
    employeeId: number;
    trainingId: number;
    completionDate?: string;
}

export const createTraining = async (trainingData: CreateTrainingPayload): Promise<TrainingResponse> => {
    try {
        const response = await apiClient.post<TrainingResponse>('/trainings', trainingData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Training:', error);
        throw error; 
    }
}; 

export const deleteTraining = async (trainingId: number): Promise<void> => {
    try {
        await apiClient.delete(`/trainings/${trainingId}`);
    } catch (error) {
        console.error('API Error Deleting Training:', error);
        throw error;
    }
};  

export const getTrainings = async (): Promise<TrainingResponse[]> => {
    try {
        const response = await apiClient.get<TrainingResponse[]>('/trainings');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Trainings:', error);
        throw error;
    }
};

export const getEmployeeTrainings = async (employeeId: number): Promise<EmployeeTrainingResponse[]> => {
    try {
        const response = await apiClient.get<EmployeeTrainingResponse[]>(`/trainings/employee/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Employee Trainings:', error);
        throw error;
    }
};

export const getTrainingById = async (trainingId: number): Promise<TrainingResponse> => {
    try {
        const response = await apiClient.get<TrainingResponse>(`/trainings/${trainingId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Training by ID:', error);
        throw error;
    }
}; 

export const updateTraining = async (trainingId: number, trainingData: CreateTrainingPayload): Promise<TrainingResponse> => {
    try {
        const response = await apiClient.put<TrainingResponse>(`/trainings/${trainingId}`, trainingData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Training:', error);
        throw error;
    }
};

export const assignTraining = async (data: AssignTrainingPayload): Promise<EmployeeTrainingResponse> => {
    try {
        const response = await apiClient.post<EmployeeTrainingResponse>('/trainings/assign', data);
        return response.data;
    } catch (error) {
        console.error('API Error Assigning Training:', error);
        throw error;
    }
};

export const removeTraining = async (employeeId: number, trainingId: number): Promise<void> => {
    try {
        await apiClient.post('/trainings/remove', { employeeId, trainingId });
    } catch (error) {
        console.error('API Error Removing Training:', error);
        throw error;
    }
};