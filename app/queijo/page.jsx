'use client';

import React from 'react';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminDashboard } from '../../components/admin/AdminDashboard';

function CMSContent() {
    const { isAdminAuthenticated, mounted } = useAdmin();

    if (!mounted) {
        return <div className="min-h-screen bg-[#0a0a0c]" />;
    }

    if (!isAdminAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <AdminLayout>
            <AdminDashboard />
        </AdminLayout>
    );
}

export default function CMSPage() {
    return (
        <AdminProvider>
            <CMSContent />
        </AdminProvider>
    );
}
