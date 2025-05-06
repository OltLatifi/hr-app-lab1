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