import React from 'react';

import CompanyForm from '@/components/admin/company-form';
import InviteUser from '@/components/admin/invite-user';
import CompanyList from '@/components/admin/company-list';
const AdminPage: React.FC = () => {

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div> 
                <h1 className="text-2xl font-bold mb-4">System Administration</h1>
                <CompanyForm />
                <InviteUser />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Companies</h2>
                <CompanyList />
            </div>
        </div>
    );
};

export default AdminPage; 