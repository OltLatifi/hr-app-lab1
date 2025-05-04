import { create } from 'zustand';
import apiClient from '../lib/api-client';
import { checkAuthStatus } from '@/services/authService';
import { User } from '@/types/user';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthActions {
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    _setUser: (user: User | null) => void;
    _setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    user: null,
    isLoading: true, 
    isAuthenticated: false,
    
    _setUser: (user) => {
        set({ 
            user: user, 
            isAuthenticated: !!user, 
        });
    },
 
    _setLoading: (loading) => {
        set({ isLoading: loading });
    },

    checkAuthStatus: async () => {
        set({ isLoading: true }); 
        try {
            const response = await checkAuthStatus();
            get()._setUser(response.user); 
        } catch (error) {
            console.log('Check auth status failed, setting user to null:', error);
            get()._setUser(null); 
        } finally {
            set({ isLoading: false }); 
        }
    },

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