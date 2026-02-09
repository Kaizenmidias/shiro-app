'use client';

import React from 'react';
import { useGoals } from '../hooks/useGoals';
import { useHealth } from '../hooks/useHealth';
import { useFinance } from '../hooks/useFinance';
import { useRoutine } from '../hooks/useRoutine';
import { CheckCircle, Activity, DollarSign, ArrowRight, Circle, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
    const { goals } = useGoals();
    const { userData } = useHealth();
    const { reserve: financeReserve, expenses, income, shoppingList } = useFinance();
    const { getTodaysTasks } = useRoutine();

    const todaysTasks = getTodaysTasks();
    const completedTasks = todaysTasks.filter(t => t.completed).length;
    const totalTasks = todaysTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate Estimated Net Balance (Saldo Líquido Estimado)
    // Income - (Total Fixed Expenses + Total Shopping) - Reserve is kept separate
    const totalFixedExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.value || 0), 0);
    const totalShopping = shoppingList.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
    const estimatedBalance = (income || 0) - totalFixedExpenses - totalShopping;

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

            {/* Daily Progress */}
            <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between h-auto border-[var(--primary-glow)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                <div className="flex justify-between items-start z-10">
                    <div className="flex flex-col justify-center flex-1">
                        <h2 className="text-xs font-mono text-[var(--primary)] mb-4 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse shadow-[0_0_10px_var(--primary)]" />
                            Status Diário
                        </h2>
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{Math.round(progress)}<span className="text-2xl text-[var(--text-muted)] font-bold">%</span></span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-2 font-medium flex items-center gap-2">
                            <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full" />
                            {totalTasks - completedTasks} missões restantes
                        </p>

                        {/* Routine Tasks Summary */}
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-3 font-bold">Rotina de Hoje</p>
                            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-none">
                                {todaysTasks.length > 0 ? (
                                    todaysTasks.slice(0, 4).map((task, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                            {task.completed ? (
                                                <CheckCircle2 size={14} className="text-[var(--primary)] flex-shrink-0" />
                                            ) : (
                                                <Circle size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                                            )}
                                            <span className={`truncate ${task.completed ? 'text-[var(--text-muted)] line-through' : 'text-white'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-[var(--text-muted)] italic">Nenhuma tarefa configurada</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center ml-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r={radius}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r={radius}
                                stroke="var(--primary)"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                strokeLinecap="round"
                            />
                        </svg>
                        <CheckCircle className="absolute text-[var(--primary)] opacity-90 drop-shadow-[0_0_10px_var(--primary)]" size={32} />
                    </div>
                </div>
            </div>

            {/* Right Column - Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 h-full">

                {/* Health Summary */}
                <div className="glass-panel p-6 flex flex-col justify-between h-32 lg:h-auto relative overflow-hidden group hover:border-[#00ffaa]/40 transition-all hover:-translate-y-1 duration-300">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00ffaa] opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition-opacity" />

                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-2.5 rounded-xl bg-[#00ffaa]/10 border border-[#00ffaa]/10 group-hover:border-[#00ffaa]/30 transition-colors">
                            <Activity size={22} className="text-[#00ffaa]" />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-[#00ffaa]/70 bg-[#00ffaa]/5 border border-[#00ffaa]/10 px-2 py-1 rounded">BIO-DADOS</span>
                    </div>

                    <div className="relative z-10 mt-auto pt-4">
                        <p className="text-3xl font-bold text-white tracking-tight">
                            {userData.weight || '--'}<span className="text-sm text-[var(--text-muted)] ml-1 font-normal">kg</span>
                        </p>
                        <div className="w-full bg-[var(--surface-highlight)] h-1.5 mt-3 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00ffaa] w-1/2 shadow-[0_0_10px_#00ffaa]" />
                        </div>
                    </div>
                </div>

                {/* Finance Summary - Available Balance */}
                <div className="glass-panel p-6 flex flex-col justify-between h-32 lg:h-auto relative overflow-hidden group hover:border-[#ffcc00]/40 transition-all hover:-translate-y-1 duration-300">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffcc00] opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition-opacity" />

                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-2.5 rounded-xl bg-[#ffcc00]/10 border border-[#ffcc00]/10 group-hover:border-[#ffcc00]/30 transition-colors">
                            <DollarSign size={22} className="text-[#ffcc00]" />
                        </div>
                        <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="relative z-10 mt-auto pt-2">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-2">Saldo Liquido</p>
                        <p className="text-2xl font-bold text-white mb-1">
                            R$ {estimatedBalance.toFixed(2)}
                        </p>
                        <span className={`text-xs font-mono px-2 py-1 rounded border ${estimatedBalance >= 0 ? 'text-[#00ffaa] bg-[#00ffaa]/10 border-[#00ffaa]/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'}`}>
                            {estimatedBalance >= 0 ? 'Positivo' : 'Negativo'}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] mt-3 pt-3 border-t border-white/5 uppercase tracking-wide flex justify-between">
                            <span>Reserva</span>
                            <span className="text-white font-bold">R$ {financeReserve?.current?.toLocaleString() || '0'}</span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
