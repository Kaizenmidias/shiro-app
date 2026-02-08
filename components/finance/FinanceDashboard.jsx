'use client';

import React, { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    ShoppingCart,
    CreditCard,
    PiggyBank,
    Plus,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    X
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CurrencyInput } from './CurrencyInput';

export const FinanceDashboard = ({
    income,
    setIncome,
    expenses,
    shoppingList,
    cards,
    reserve
}) => {
    const { formatCurrency } = useGame();
    const [isEditingIncome, setIsEditingIncome] = useState(false);
    const [tempIncome, setTempIncome] = useState(income);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
    const paidExpenses = expenses.filter(exp => exp.paid).reduce((sum, exp) => sum + exp.value, 0);
    const remainingExpenses = totalExpenses - paidExpenses;

    const shoppingTotal = shoppingList.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

    // Monthly bill: sum of installments for all active cards
    const monthlyCardBill = cards.reduce((sum, card) => {
        if (card.paidInstallments >= card.installments) return sum;
        return sum + (card.value / card.installments);
    }, 0);

    // Remaining bill to pay this month: installments where paidThisMonth is false
    const pendingCardBill = cards.reduce((sum, card) => {
        if (card.paidInstallments >= card.installments || card.paidThisMonth) return sum;
        return sum + (card.value / card.installments);
    }, 0);

    const totalOutflow = totalExpenses + shoppingTotal + monthlyCardBill;
    const balance = income - totalOutflow;

    const handleSaveIncome = (e) => {
        if (e) e.preventDefault();
        setIncome(tempIncome || 0);
        setIsEditingIncome(false);
    };

    return (
        <div className="space-y-8 animate-fade-in font-poppins pb-24">
            {/* Header: Consolidated Balance */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-[var(--primary)]/20 to-transparent p-8 rounded-3xl border border-[var(--primary)]/20 shadow-[0_20px_50px_rgba(0,243,255,0.1)]">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">PANORAMA GERAL</h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest mt-1">Controle Financeiro Consolidado</p>
                </div>
                <div className="text-right mt-6 md:mt-0">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest block mb-1">Saldo Líquido Estimado</span>
                    <h2 className={`text-5xl font-black tracking-tighter ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        {formatCurrency(balance)}
                    </h2>
                </div>
            </div>

            {/* Core Cards: Income, Fixed Expenses, Shopping */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 border-l-4 border-l-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/5 to-transparent relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[var(--primary)]/10 rounded-2xl text-[var(--primary)] group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        {isEditingIncome ? (
                            <form onSubmit={handleSaveIncome} className="flex gap-2 animate-fade-in items-center">
                                <CurrencyInput
                                    className="w-32 bg-black/40 border border-[var(--primary)]/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                    value={tempIncome}
                                    onChange={setTempIncome}
                                    autoFocus
                                />
                                <button type="submit" className="text-[var(--primary)] hover:text-white"><CheckCircle2 size={18} /></button>
                                <button type="button" onClick={() => setIsEditingIncome(false)} className="text-rose-400 hover:text-white"><X size={18} /></button>
                            </form>
                        ) : (
                            <button onClick={() => setIsEditingIncome(true)} className="text-[10px] uppercase font-black text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">Editar Receita</button>
                        )}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Receita Mensal</span>
                    <h2 className="text-3xl font-black text-white mt-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{formatCurrency(income)}</h2>
                </div>

                <div className="glass-panel p-6 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-500/5 to-transparent group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
                            <TrendingDown size={24} />
                        </div>
                        <span className="text-[10px] uppercase font-black text-rose-500/50 italic">Fixas + Compras + Cartão</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Total de Saídas no Mês</span>
                    <h2 className="text-3xl font-black text-white mt-1">{formatCurrency(totalOutflow)}</h2>
                </div>

                <div className="glass-panel p-6 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-[0_10px_30px_rgba(16,185,129,0.1)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <PiggyBank size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <PiggyBank size={24} />
                        </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Reserva Atual</span>
                    <h2 className="text-3xl font-black text-white mt-1">{formatCurrency(reserve.current)}</h2>
                </div>
            </div>

            {/* Graphs and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution Chart (Manual Bars) */}
                <div className="glass-panel p-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <ArrowUpRight size={18} className="text-[var(--primary)]" />
                        Distribuição de Gastos
                    </h3>

                    <div className="space-y-6">
                        {/* Fixed Expenses Bar */}
                        <div className="group">
                            <div className="flex justify-between text-[10px] uppercase font-black mb-2 px-1">
                                <span className="text-[var(--text-muted)] group-hover:text-white transition-colors">Despesas Fixas</span>
                                <span className="text-white">{formatCurrency(totalExpenses)}</span>
                            </div>
                            <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                <div
                                    className="h-full bg-blue-500/80 transition-all duration-1000 group-hover:bg-blue-400"
                                    style={{ width: `${Math.min((totalExpenses / income || 0) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Shopping Bar */}
                        <div className="group">
                            <div className="flex justify-between text-[10px] uppercase font-black mb-2 px-1">
                                <span className="text-[var(--text-muted)] group-hover:text-white transition-colors">Compras do Mês</span>
                                <span className="text-white">{formatCurrency(shoppingTotal)}</span>
                            </div>
                            <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                <div
                                    className="h-full bg-purple-500/80 transition-all duration-1000 group-hover:bg-purple-400"
                                    style={{ width: `${Math.min((shoppingTotal / income || 0) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Credit Cards Bar */}
                        <div className="group">
                            <div className="flex justify-between text-[10px] uppercase font-black mb-2 px-1">
                                <span className="text-[var(--text-muted)] group-hover:text-white transition-colors">Parcelas de Cartão</span>
                                <span className="text-white">{formatCurrency(monthlyCardBill)}</span>
                            </div>
                            <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                <div
                                    className="h-full bg-orange-500/80 transition-all duration-1000 group-hover:bg-orange-400"
                                    style={{ width: `${Math.min((monthlyCardBill / income || 0) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[var(--primary)] pulse" />
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Fator de Comprometimento</span>
                        </div>
                        <span className="text-xl font-black text-white">{((totalOutflow / income || 0) * 100).toFixed(1)}%</span>
                    </div>
                </div>

                {/* Status and Action Overview */}
                <div className="glass-panel p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Status de Pagamento</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-5 rounded-3xl border border-white/5 hover:border-[var(--primary)]/30 transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <Clock size={18} className="text-blue-400" />
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase text-left">Despesas Fixas</span>
                                </div>
                                <div className="text-xl font-bold text-white tracking-tight">{formatCurrency(remainingExpenses)} pendente</div>
                            </div>
                            <div className="bg-black/20 p-5 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <CreditCard size={18} className="text-orange-500" />
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase text-left">Parcelas Cartão</span>
                                </div>
                                <div className="text-xl font-bold text-white tracking-tight">{formatCurrency(pendingCardBill)} pendente</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-white/5 pt-8">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Meta de Reserva</span>
                            <span className="text-xs font-bold text-[var(--primary)]">{((reserve.current / reserve.goal || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-[var(--primary)]"
                                style={{ width: `${Math.min((reserve.current / reserve.goal || 0) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-center text-[var(--text-muted)] mt-4 italic">
                            Faltam <span className="text-white font-bold">{formatCurrency(reserve.goal - reserve.current)}</span> para atingir sua meta de {formatCurrency(reserve.goal)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
