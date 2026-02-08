'use client';

import React from 'react';
import { AdminProvider, useAdmin } from '../../../contexts/AdminContext';
import { AdminLogin } from '../../../components/admin/AdminLogin';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { WorkoutManagement } from '../../../components/admin/WorkoutManagement';

function WorkoutContent() {
    const { isAdminAuthenticated, mounted } = useAdmin();

    if (!mounted) {
        return <div className="min-h-screen bg-[#0a0a0c]" />;
    }

    if (!isAdminAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <AdminLayout>
            <WorkoutManagement />
        </AdminLayout>
    );
}

export default function WorkoutPage() {
    return (
        <AdminProvider>
            <WorkoutContent />
        </AdminProvider>
    );
}
