'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { RankHeader } from './RankHeader';
import { useAuth } from '../contexts/AuthContext';
import { AuthScreen } from './AuthScreen';
import { SettingsModal } from './SettingsModal';
import {
    LayoutDashboard,
    Heart,
    Wallet,
    Home,
    Settings,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Dumbbell,
    Utensils,
    User,
    CreditCard,
    ShoppingCart,
    PiggyBank,
    Target,
    Calendar,
    Clock,
    CheckSquare,
    LogOut,
    DollarSign,
    ShieldCheck
} from 'lucide-react';

export const LayoutShell = ({ children }) => {
    const pathname = usePathname();
    const { isAuthenticated, mounted, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [expandedSections, setExpandedSections] = useState({
        goals: true,
        health: false,
        finance: false
    });

    // Helper to check if a route is active (including sub-routes)
    const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

    // Skip authentication check for CMS routes
    const isCMSRoute = pathname.startsWith('/queijo');

    if (!mounted) return <div className="min-h-screen bg-[#0a0a0c]" />;

    // CMS routes handle their own authentication
    if (isCMSRoute) return <>{children}</>;

    // Regular app routes require user authentication
    if (!isAuthenticated) return <AuthScreen />;

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const navigation = [
        {
            id: 'home',
            path: '/',
            label: 'Início',
            icon: Home,
            exact: true
        },
        {
            id: 'personal',
            path: '/personal',
            label: 'Gestão Pessoal',
            icon: Calendar,
            subItems: [
                { path: '/personal/routine', label: 'Rotina', icon: CheckSquare },
                { path: '/personal/agenda', label: 'Agenda', icon: Calendar },
            ]
        },
        {
            id: 'health',
            path: '/health',
            label: 'Saúde',
            icon: Heart,
            subItems: [
                { path: '/health/body', label: 'Corpo', icon: User },
                { path: '/health/diet', label: 'Dieta', icon: Utensils },
                { path: '/health/workout', label: 'Treino', icon: Dumbbell },
            ]
        },
        {
            id: 'finance',
            path: '/finance',
            label: 'Finanças',
            icon: Wallet,
            subItems: [
                { path: '/finance', label: 'Geral', icon: LayoutDashboard },
                { path: '/finance/expenses', label: 'Despesas', icon: DollarSign },
                { path: '/finance/shopping', label: 'Compras', icon: ShoppingCart },
                { path: '/finance/cards', label: 'Cartões', icon: CreditCard },
                { path: '/finance/reserve', label: 'Reserva', icon: PiggyBank },
            ]
        },
    ];

    // Recursive Sidebar Item Component
    const SidebarItem = ({ item }) => {
        const active = item.exact ? pathname === item.path : isActive(item.path);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedSections[item.id];

        const handleClick = (e) => {
            if (hasSubItems) {
                e.preventDefault();
                toggleSection(item.id);
            } else {
                setIsMobileMenuOpen(false);
            }
        };

        return (
            <div className="mb-1">
                <Link
                    href={hasSubItems ? '#' : item.path}
                    onClick={handleClick}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${active
                        ? 'bg-[var(--glass-bg)] border border-[var(--primary-dim)]/50 text-white shadow-[0_0_15px_rgba(0,243,255,0.05)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-highlight)] hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} className={active ? 'text-[var(--primary)] drop-shadow-[0_0_5px_var(--primary)]' : ''} />
                        <span className="font-bold tracking-wide text-sm">{item.label}</span>
                    </div>
                    {hasSubItems && (
                        isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                </Link>

                {/* Submenu */}
                {hasSubItems && isExpanded && (
                    <div className="ml-4 pl-4 border-l border-[var(--glass-border)] mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                            const subActive = pathname === subItem.path;
                            const SubIcon = subItem.icon;
                            return (
                                <Link
                                    key={subItem.path}
                                    href={subItem.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-all text-xs font-medium ${subActive
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                                        : 'text-[var(--text-muted)] hover:text-white'
                                        }`}
                                >
                                    <SubIcon size={14} />
                                    {subItem.label}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Sidebar Content Logic
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 md:p-8">
                <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <span className="text-[var(--primary)] text-3xl">///</span>
                    SHIRO
                </h1>
                <p className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase opacity-60 pl-10">Shiro Protocol</p>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto scrollbar-none">
                {navigation.map((item) => <SidebarItem key={item.id} item={item} />)}
            </nav>

            <div className="p-4 mt-auto border-t border-[var(--glass-border)] space-y-2">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-highlight)] transition-all"
                >
                    <Settings size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Configurações</span>
                </button>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-bold"
                >
                    <LogOut size={18} />
                    <span className="text-xs uppercase tracking-wider">Encerrar Sessão</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[var(--bg-color)]">

            {/* =========================================
            DESKTOP SIDEBAR 
            ========================================= */}
            <aside className="hidden md:flex w-64 fixed inset-y-0 left-0 border-r border-[var(--glass-border)] bg-[var(--surface-color)]/50 backdrop-blur-xl z-50">
                <SidebarContent />
            </aside>

            {/* =========================================
            MOBILE DRAWER (Hamburger)
            ========================================= */}
            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`md:hidden fixed inset-y-0 left-0 w-[80%] max-w-sm bg-[var(--surface-color)] border-r border-[var(--glass-border)] z-[70] transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </div>


            {/* =========================================
            MAIN CONTENT AREA
            ========================================= */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">

                {/* Mobile Header */}
                <header className="md:hidden flex justify-between items-center p-4 border-b border-[var(--glass-border)] bg-[var(--bg-color)]/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-[var(--text-muted)] hover:text-white"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-bold tracking-tighter flex items-center gap-2">
                            <span className="text-[var(--primary)] text-xl">///</span> SHIRO
                        </h1>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
                    <RankHeader />
                    <div className="animate-fade-in mt-6">
                        {children}
                    </div>
                </main>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
};

// DollarSign icon is now imported at the top of the file
