import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import Sidebar from '@/components/sidebar';

interface ProtectedRouteProps {
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isLoading = useAuthStore(state => state.isLoading);
    const user = useAuthStore(state => state.user);
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>; 
    }

    const hasRequiredRole = () => {
        if (!requiredRole) return true;
        return user?.role.name === requiredRole;
    };

    if (!isAuthenticated || !hasRequiredRole()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <button 
                onClick={toggleMobileSidebar} 
                className="md:hidden fixed top-4 left-6 z-20 p-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-label="Open sidebar"
                aria-expanded={isMobileSidebarOpen}
                aria-controls="mobile-sidebar"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>

            <Sidebar isMobileOpen={isMobileSidebarOpen} onCloseMobile={closeMobileSidebar} />

            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                ></div>
            )}

            <main className="flex-grow p-6 overflow-y-auto transition-all duration-300 ease-in-out mt-2">
                <Outlet />
            </main>
        </div>
    );
};

export default ProtectedRoute; 