import apiClient from '@/lib/api-client';

export interface CreateEmployeePayload {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    hireDate: string;
    jobTitleId: number;
    departmentId: number;
}

export interface EmployeeFilters {
    departmentId?: string;
    managerId?: string;
    statusId?: string;
    searchTerm?: string;
}

export interface EmployeeResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    hireDate: string;
    jobTitle: {
        id: number;
        name: string;
    };
    department: {
        departmentId: number;
        departmentName: string;
    };
    manager: {
        id: number;
        firstName: string;
        lastName: string;
    };
    employmentStatus: {
        id: number;
        statusName: string;
    };
    employeeBenefits: Array<{
        id: number;
        benefit: {
            id: number;
            name: string;
        };
        enrollmentDate: string;
    }>;
    employeeTraining: Array<{
        employeeTrainingId: number;
        trainingProgram: {
            id: number;
            name: string;
        };
    }>;
}

export const createEmployee = async (employeeData: CreateEmployeePayload): Promise<EmployeeResponse> => {
    try {
        const response = await apiClient.post<EmployeeResponse>('/employees', employeeData);
        return response.data;
    } catch (error) {
        console.error('API Error Creating Employee:', error);
        throw error; 
    }
}; 

export const deleteEmployee = async (employeeId: number): Promise<void> => {
    try {
        await apiClient.delete(`/employees/${employeeId}`);
    } catch (error) {
        console.error('API Error Deleting Employee:', error);
        throw error;
    }
};  

export const getEmployees = async (filters?: EmployeeFilters): Promise<EmployeeResponse[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (filters) {
            if (filters.departmentId) queryParams.append('departmentId', filters.departmentId);
            if (filters.managerId) queryParams.append('managerId', filters.managerId);
            if (filters.statusId) queryParams.append('statusId', filters.statusId);
            if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
        }
        const response = await apiClient.get<EmployeeResponse[]>(`/employees?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Employees:', error);
        throw error;
    }
}; 

export const getEmployeeById = async (employeeId: number): Promise<EmployeeResponse> => {
    try {
        const response = await apiClient.get<EmployeeResponse>(`/employees/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error('API Error Fetching Employee by ID:', error);
        throw error;
    }
}; 

export const updateEmployee = async (employeeId: number, employeeData: CreateEmployeePayload): Promise<EmployeeResponse> => {
    try {
        const response = await apiClient.put<EmployeeResponse>(`/employees/${employeeId}`, employeeData);
        return response.data;
    } catch (error) {
        console.error('API Error Updating Employee:', error);
        throw error;
    }
};