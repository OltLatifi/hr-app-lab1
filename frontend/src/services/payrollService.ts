import apiClient from '@/lib/api-client';
import { Employee } from '@/types/employee';

export interface CreatePayrollPayload {
    employeeId: number;
    payPeriodStartDate: string;
    payPeriodEndDate: string;
    netPay: number;
    grossPay: number;
}

export interface PayrollResponse {
    id: number;
    employeeId: number;
    payPeriodStartDate: string;
    payPeriodEndDate: string;
    netPay: number;
    grossPay: number;
    createdAt: string;
    updatedAt: string;
    employee: Employee;
}

export const createPayroll = async (payrollData: CreatePayrollPayload): Promise<PayrollResponse> => {
    try {
        const response = await apiClient.post<PayrollResponse>('/payrolls', payrollData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Payroll:', error);
        throw error; 
    }
}; 

export const deletePayroll = async (payrollId: number): Promise<void> => {
    try {
        await apiClient.delete(`/payrolls/${payrollId}`);
    } catch (error) {
        console.error('API Error Deleting Payroll:', error);
        throw error;
    }
};  

export const getPayrolls = async (): Promise<PayrollResponse[]> => {
    try {
        const response = await apiClient.get<PayrollResponse[]>('/payrolls');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Payrolls:', error);
        throw error;
    }
}; 

export const getPayrollById = async (payrollId: number): Promise<PayrollResponse> => {
    try {
        const response = await apiClient.get<PayrollResponse>(`/payrolls/${payrollId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Payroll by ID:', error);
        throw error;
    }
}; 

export const updatePayroll = async (payrollId: number, payrollData: CreatePayrollPayload): Promise<PayrollResponse> => {
    try {
        const response = await apiClient.put<PayrollResponse>(`/payrolls/${payrollId}`, payrollData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Payroll:', error);
        throw error;
    }
};

export const getPayrollsByMonth = async (): Promise<Record<number, number>> => {
    try {
        const response = await apiClient.get('/payrolls/calculate-by-month');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Payrolls by Month:', error);
        throw error;
    }
};

export const getPayrollsByDepartment = async (): Promise<Record<number, number>> => {
    try {
        const response = await apiClient.get('/payrolls/calculate-by-department');
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Payrolls by Department:', error);
        throw error;
    }
};