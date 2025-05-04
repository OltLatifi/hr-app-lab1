import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAuthStatus } from '@/services/authService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";

import CompanyForm from '@/components/admin/company-form';
import InviteUser from '@/components/admin/invite-user';
import CompanyList from '@/components/admin/company-list';
const AdminPage: React.FC = () => {
    const authenticatedUser = useAuthStore(state => state.user);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!authenticatedUser) {
            fetchAuthStatus()
                .then(data => {
                    setIsAuthorized(data.user.isAdmin);
                })
                .catch(() => setIsAuthorized(false));
        } else {
            setIsAuthorized(authenticatedUser.isAdmin);
        }
    }, [authenticatedUser]);

    if (isAuthorized === null) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (isAuthorized === false) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to access this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div> 
                <h1 className="text-2xl font-bold mb-4">System Administration</h1>
                <CompanyForm />
                <InviteUser isAuthorized={isAuthorized} />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Companies</h2>
                <CompanyList />
            </div>
        </div>
    );
};

export default AdminPage; 