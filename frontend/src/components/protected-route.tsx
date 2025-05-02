import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import Navbar from '@/components/navbar';

const ProtectedRoute: React.FC = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isLoading = useAuthStore(state => state.isLoading);
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default ProtectedRoute; 