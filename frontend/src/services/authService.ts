import axios, { AxiosError } from 'axios';
import { RegisterFormValues } from '../pages/register-page';

interface User {
    id: number;
    name: string;
    email: string;
}

interface RegisterSuccessResponse {
    user: User; 
    token: string;
}

interface ApiErrorResponse {
    message: string;
}

const API_URL = "http://localhost:8000"

export const registerUser = async (userData: RegisterFormValues): Promise<RegisterSuccessResponse> => {
    try {
        const response = await axios.post<RegisterSuccessResponse>(`${API_URL}/auth/register`, {
            name: userData.name,
            email: userData.email,
            password: userData.password,
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Registration failed';
        throw new Error(errorMessage);
    }
}; 