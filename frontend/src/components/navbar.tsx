import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

const Navbar: React.FC = () => {
    const handleLogout = () => {
        useAuthStore.getState().logout();
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold">
                    <Link to="/">HR Management System</Link>
                </div>
                <div className="space-x-4">
                    <Link to="/departments">Departments</Link>
                    <Link to="/jobtitles">Job Titles</Link>
                    <Link to="/employment-statuses">Employment Statuses</Link>
                    <Link to="/leave-requests">Leave Requests</Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 