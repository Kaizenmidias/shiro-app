'use client';

import React from 'react';
import { AdminProvider, useAdmin } from '../../../contexts/AdminContext';
import { AdminLogin } from '../../../components/admin/AdminLogin';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { UserManagement } from '../../../components/admin/UserManagement';

function UsersContent() {
    const { isAdminAuthenticated, mounted } = useAdmin();

    if (!mounted) {
        return <div className="min-h-screen bg-[#0a0a0c]" />;
    }

    if (!isAdminAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <AdminLayout>
            <UserManagement />
        </AdminLayout>
    );
}

export default function UsersPage() {
    return (
        <AdminProvider>
            <UsersContent />
        </AdminProvider>
    );
}
