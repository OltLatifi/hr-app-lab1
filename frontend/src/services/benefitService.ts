import apiClient from '@/lib/api-client';

export interface CreateBenefitPayload {
    name: string;
}

export interface BenefitResponse {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeBenefitResponse {
    id: number;
    employeeId: number;
    benefitId: number;
    enrollmentDate: string;
    createdAt: string;
    updatedAt: string;
    benefit: BenefitResponse;
}

export interface AssignBenefitPayload {
    employeeId: number;
    benefitId: number;
    enrollmentDate: string;
}

export const createBenefit = async (benefitData: CreateBenefitPayload): Promise<BenefitResponse> => {
    try {
        const response = await apiClient.post<BenefitResponse>('/benefits', benefitData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Benefit:', error);
        throw error; 
    }
}; 

export const deleteBenefit = async (benefitId: number): Promise<void> => {
    try {
        await apiClient.delete(`/benefits/${benefitId}`);
    } catch (error) {
        console.error('API Error Deleting Benefit:', error);
        throw error;
    }
};  

export const getBenefits = async (): Promise<BenefitResponse[]> => {
    try {
        const response = await apiClient.get<BenefitResponse[]>('/benefits');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Benefits:', error);
        throw error;
    }
};

export const getEmployeeBenefits = async (employeeId: number): Promise<EmployeeBenefitResponse[]> => {
    try {
        const response = await apiClient.get<EmployeeBenefitResponse[]>(`/benefits/employee/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Employee Benefits:', error);
        throw error;
    }
};

export const getBenefitById = async (benefitId: number): Promise<BenefitResponse> => {
    try {
        const response = await apiClient.get<BenefitResponse>(`/benefits/${benefitId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Benefit by ID:', error);
        throw error;
    }
}; 

export const updateBenefit = async (benefitId: number, benefitData: CreateBenefitPayload): Promise<BenefitResponse> => {
    try {
        const response = await apiClient.put<BenefitResponse>(`/benefits/${benefitId}`, benefitData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Benefit:', error);
        throw error;
    }
};

export const assignBenefit = async (data: AssignBenefitPayload): Promise<EmployeeBenefitResponse> => {
    try {
        const response = await apiClient.post<EmployeeBenefitResponse>('/benefits/assign', data);
        return response.data;
    } catch (error) {
        console.error('API Error Assigning Benefit:', error);
        throw error;
    }
};

export const removeBenefit = async (employeeId: number, benefitId: number): Promise<void> => {
    try {
        await apiClient.post('/benefits/remove', { employeeId, benefitId });
    } catch (error) {
        console.error('API Error Removing Benefit:', error);
        throw error;
    }
};