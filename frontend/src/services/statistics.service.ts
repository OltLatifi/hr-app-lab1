import apiClient from '../lib/api-client';

interface CompanyStats {
    totalCompanies: number;
    activeCompanies: number;
    companiesWithAdmin: number;
    companiesWithoutAdmin: number;
    subscriptionStats: {
        active: number;
        expired: number;
        cancelled: number;
        byPlan: Record<string, number>;
    };
}

interface EmployeeStats {
    totalEmployees: number;
    employeesByCompany: Array<{
        companyName: string;
        count: number;
    }>;
    growthByMonth: Array<{
        month: number;
        count: number;
    }>;
}

interface TrainingStats {
    totalPrograms: number;
    activePrograms: number;
    completionRates: Array<{
        programName: string;
        completionRate: number;
    }>;
}

interface LeaveStats {
    totalRequests: number;
    byStatus: {
        approved: number;
        pending: number;
        rejected: number;
    };
    byType: Array<{
        type: string;
        count: number;
    }>;
}

export const getCompanyStats = async (): Promise<CompanyStats> => {
    const response = await apiClient.get('/statistics/company');
    return response.data;
};

export const getEmployeeStats = async (): Promise<EmployeeStats> => {
    const response = await apiClient.get('/statistics/employee');
    return response.data;
};

export const getTrainingStats = async (): Promise<TrainingStats> => {
    const response = await apiClient.get('/statistics/training');
    return response.data;
};

export const getLeaveStats = async (): Promise<LeaveStats> => {
    const response = await apiClient.get('/statistics/leave');
    return response.data;
}; 