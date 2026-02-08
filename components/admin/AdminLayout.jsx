'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Utensils,
    Dumbbell,
    Settings,
    LogOut,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
    const { adminUser, logoutAdmin } = useAdmin();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { id: 'dashboard', path: '/queijo', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { id: 'users', path: '/queijo/users', label: 'Usuários', icon: Users },
        { id: 'nutrition', path: '/queijo/nutrition', label: 'Nutrição', icon: Utensils },
        { id: 'workout', path: '/queijo/workout', label: 'Treino', icon: Dumbbell },
        { id: 'settings', path: '/queijo/settings', label: 'Configurações', icon: Settings },
    ];

    const isActive = (item) => {
        if (item.exact) return pathname === item.path;
        return pathname.startsWith(item.path);
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg-color)]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 fixed inset-y-0 left-0 border-r border-[var(--glass-border)] bg-[var(--surface-color)]/50 backdrop-blur-xl z-50 flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--glass-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]">
                            <ShieldCheck size={24} className="text-[var(--primary)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white">SHIRO CMS</h1>
                            <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-none">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${active
                                            ? 'bg-[var(--glass-bg)] border border-[var(--primary-dim)]/50 text-white shadow-[0_0_15px_rgba(0,243,255,0.05)]'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)] hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className={active ? 'text-[var(--primary)] drop-shadow-[0_0_5px_var(--primary)]' : ''} />
                                        <span className="font-bold tracking-wide text-sm">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${active ? 'translate-x-1' : ''}`} />
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Admin Info & Logout */}
                <div className="p-4 border-t border-[var(--glass-border)] space-y-2">
                    <div className="glass-panel p-3 border-[var(--primary)]/30">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Logado como</p>
                        <p className="text-sm font-bold text-white">{adminUser?.username}</p>
                    </div>
                    <button
                        onClick={logoutAdmin}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                    >
                        <LogOut size={18} />
                        <span className="text-xs uppercase tracking-wider">Sair do CMS</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="border-b border-[var(--glass-border)] bg-[var(--bg-color)]/80 backdrop-blur-md sticky top-0 z-40 p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                                {navigation.find(n => isActive(n))?.label || 'Dashboard'}
                            </h2>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                                Shiro Protocol /// Admin Access
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-bold text-white">{adminUser?.username}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Administrador</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 border-2 border-[var(--primary)] flex items-center justify-center">
                                <ShieldCheck size={20} className="text-[var(--primary)]" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
