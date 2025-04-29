import { create } from 'zustand';
import apiClient from '../lib/api-client';

interface User {
    id: number;
    name: string;
    email: string;
}

interface LoginResponse {
    user: User;
    message: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    _setUser: (user: User | null) => void;
    _setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    register: async (name: string, email: string, password: string) => {
        try {
            const response = await apiClient.post<LoginResponse>('/auth/register', { name, email, password });
            get()._setUser(response.data.user);
            console.log('Registration successful');
        } catch (error) {
            console.error('Registration failed:', error);
            get()._setUser(null);
        } finally {
            get()._setLoading(false);
        }
    },
    

    _setUser: (user) => {
        set({ user: user, isAuthenticated: !!user });
    },
 
    _setLoading: (loading) => {
        set({ isLoading: loading });
    },

    checkAuthStatus: async () => {
        get()._setLoading(true);
        try {
            console.warn("checkAuthStatus needs a backend endpoint (e.g., /api/users/me) to verify session. Assuming not logged in.");
            get()._setUser(null);
        } catch (error) {
            console.log('Check auth status failed, likely not logged in:', error);
            get()._setUser(null);
        } finally {
            get()._setLoading(false);
        }
    },

    login: async (email, password) => {
        get()._setLoading(true);
        try {
            const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
            get()._setUser(response.data.user);
            console.log('Login successful');
        } catch (error) {
            console.error('Login failed:', error);
            get()._setUser(null);
        } finally {
            get()._setLoading(false);
        }
    },

    // Logout Action
    logout: async () => {
        get()._setLoading(true);
        try {
            await apiClient.post('/auth/logout');
            console.log('Logout successful on backend.');
        } catch (error) {
            console.error('Backend logout failed:', error);
            
        } finally {
            get()._setUser(null);
            get()._setLoading(false);
        }
    },
}));

useAuthStore.getState().checkAuthStatus(); 