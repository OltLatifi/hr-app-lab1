import apiClient from '@/lib/api-client';

export interface CreateJobTitlePayload {
    name: string;
}

export interface JobTitleResponse {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export const createJobTitle = async (jobTitleData: CreateJobTitlePayload): Promise<JobTitleResponse> => {
    try {
        const response = await apiClient.post<JobTitleResponse>('/jobtitles', jobTitleData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Job Title:', error);
        throw error; 
    }
}; 

export const deleteJobTitle = async (jobTitleId: number): Promise<void> => {
    try {
        await apiClient.delete(`/jobtitles/${jobTitleId}`);
    } catch (error) {
        console.error('API Error Deleting Job Title:', error);
        throw error;
    }
};  

export const getJobTitles = async (): Promise<JobTitleResponse[]> => {
    try {
        const response = await apiClient.get<JobTitleResponse[]>('/jobtitles');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Job Titles:', error);
        throw error;
    }
}; 

export const getJobTitleById = async (jobTitleId: number): Promise<JobTitleResponse> => {
    try {
        const response = await apiClient.get<JobTitleResponse>(`/jobtitles/${jobTitleId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Job Title by ID:', error);
        throw error;
    }
}; 

export const updateJobTitle = async (jobTitleId: number, jobTitleData: CreateJobTitlePayload): Promise<JobTitleResponse> => {
    try {
        const response = await apiClient.put<JobTitleResponse>(`/jobtitles/${jobTitleId}`, jobTitleData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Job Title:', error);
        throw error;
    }
};