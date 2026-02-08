'use client';

import React from 'react';
import { Users, DollarSign, TrendingUp, Activity, Target, Calendar } from 'lucide-react';

export const AdminDashboard = () => {
    // Simulated KPIs - In production, these would come from a backend
    const kpis = {
        activeUsers: 127,
        mrr: 2540.00,
        totalRevenue: 15240.00,
        engagementRate: 78.5,
        newUsersThisMonth: 23,
        churnRate: 4.2
    };

    const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
        <div className="glass-panel p-6 relative overflow-hidden group hover:border-opacity-60 transition-all hover:-translate-y-1 duration-300" style={{ borderColor: `${color}40` }}>
            <div className="absolute -top-10 -right-10 w-32 h-32 opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition-opacity" style={{ backgroundColor: color }} />

            <div className="flex justify-between items-start relative z-10 mb-4">
                <div className="p-2.5 rounded-xl border transition-colors" style={{
                    backgroundColor: `${color}10`,
                    borderColor: `${color}10`
                }}>
                    <Icon size={22} style={{ color }} />
                </div>
                {trend && (
                    <span className={`text-xs font-mono px-2 py-1 rounded border ${trend > 0 ? 'text-[#00ffaa] bg-[#00ffaa]/10 border-[#00ffaa]/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2 font-bold">{title}</p>
                <p className="text-3xl font-black text-white tracking-tight mb-1">{value}</p>
                {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <span className="text-[var(--primary)]">///</span> Dashboard
                </h1>
                <p className="text-[var(--text-muted)] text-sm font-mono uppercase tracking-widest">
                    Visão Geral do Sistema /// KPIs em Tempo Real
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard
                    title="Usuários Ativos"
                    value={kpis.activeUsers}
                    subtitle="Total de contas registradas"
                    icon={Users}
                    color="#00f3ff"
                    trend={12.5}
                />
                <KPICard
                    title="MRR (Receita Mensal)"
                    value={`R$ ${kpis.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subtitle="Monthly Recurring Revenue"
                    icon={DollarSign}
                    color="#ffcc00"
                    trend={8.3}
                />
                <KPICard
                    title="Faturamento Total"
                    value={`R$ ${kpis.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    subtitle="Acumulado desde o início"
                    icon={TrendingUp}
                    color="#9333ea"
                    trend={15.7}
                />
                <KPICard
                    title="Taxa de Engajamento"
                    value={`${kpis.engagementRate}%`}
                    subtitle="Usuários ativos nos últimos 7 dias"
                    icon={Activity}
                    color="#00ffaa"
                    trend={3.2}
                />
                <KPICard
                    title="Novos Usuários"
                    value={kpis.newUsersThisMonth}
                    subtitle="Neste mês"
                    icon={Target}
                    color="#ff6b6b"
                    trend={-2.1}
                />
                <KPICard
                    title="Taxa de Churn"
                    value={`${kpis.churnRate}%`}
                    subtitle="Cancelamentos mensais"
                    icon={Calendar}
                    color="#ff9f43"
                    trend={-1.5}
                />
            </div>

            {/* Quick Stats */}
            <div className="glass-panel p-6 border-[var(--primary)]">
                <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
                    Estatísticas Rápidas
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Média de Sessão</p>
                        <p className="text-2xl font-bold text-white">12.4<span className="text-sm text-[var(--text-muted)] ml-1">min</span></p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Retenção (30d)</p>
                        <p className="text-2xl font-bold text-white">82<span className="text-sm text-[var(--text-muted)] ml-1">%</span></p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Tarefas Criadas</p>
                        <p className="text-2xl font-bold text-white">1,247</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Taxa de Conclusão</p>
                        <p className="text-2xl font-bold text-white">67<span className="text-sm text-[var(--text-muted)] ml-1">%</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
