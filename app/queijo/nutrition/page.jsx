'use client';

import React from 'react';
import { AdminProvider, useAdmin } from '../../../contexts/AdminContext';
import { AdminLogin } from '../../../components/admin/AdminLogin';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminPanel } from '../../../components/AdminPanel';

function NutritionContent() {
    const { isAdminAuthenticated, mounted } = useAdmin();

    if (!mounted) {
        return <div className="min-h-screen bg-[#0a0a0c]" />;
    }

    if (!isAdminAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <AdminLayout>
            <AdminPanel />
        </AdminLayout>
    );
}

export default function NutritionPage() {
    return (
        <AdminProvider>
            <NutritionContent />
        </AdminProvider>
    );
}
