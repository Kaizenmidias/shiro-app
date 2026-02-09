'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, ArrowRight, Filter } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { DateInput } from '../ui/DateInput';

export const FinancialHistory = ({ history = [], currentExpenses = [], currentShopping = [], income = 0 }) => {
    const { formatCurrency } = useGame();
    
    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(startOfMonth);
    const [endDate, setEndDate] = useState(endOfMonth);
    const [filterType, setFilterType] = useState('all'); // all, income, expense

    const filteredData = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the end date fully

        // Combine history with current month's active data for a complete view
        // 1. History items
        let data = [...history];

        // 2. Current Month Data (if date range includes today)
        const today = new Date();
        if (today >= start && today <= end) {
            // Current Income
            if (income > 0) {
                data.push({
                    id: 'curr_inc',
                    type: 'income',
                    category: 'Salário/Receita',
                    title: 'Receita Atual',
                    value: income,
                    date: today.toISOString()
                });
            }

            // Current Paid Expenses
            currentExpenses.forEach(exp => {
                if (exp.paid) {
                    data.push({
                        id: `curr_exp_${exp.id}`,
                        type: 'expense',
                        category: 'Fixo',
                        title: exp.title,
                        value: exp.value,
                        date: today.toISOString()
                    });
                }
            });

            // Current Shopping
            currentShopping.forEach(item => {
                data.push({
                    id: `curr_shop_${item.id}`,
                    type: 'expense',
                    category: 'Compras',
                    title: item.title,
                    value: item.value,
                    date: item.date || today.toISOString()
                });
            });
        }

        // Filter by date
        data = data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });

        // Filter by type
        if (filterType !== 'all') {
            data = data.filter(item => item.type === filterType);
        }

        // Sort by date desc
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [history, currentExpenses, currentShopping, income, startDate, endDate, filterType]);

    const totals = useMemo(() => {
        const inc = filteredData.filter(i => i.type === 'income').reduce((sum, i) => sum + i.value, 0);
        const exp = filteredData.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.value, 0);
        return { income: inc, expense: exp, balance: inc - exp };
    }, [filteredData]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-2">
                        <Calendar size={12} /> Período
                    </label>
                    <div className="flex items-center gap-2">
                        <DateInput
                            value={startDate}
                            onChange={setStartDate}
                            className="bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[var(--primary)] w-28 text-center"
                        />
                        <span className="text-[var(--text-muted)]">-</span>
                        <DateInput
                            value={endDate}
                            onChange={setEndDate}
                            className="bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[var(--primary)] w-28 text-center"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex-1 md:flex-none ${filterType === 'all' ? 'bg-[var(--primary)] text-black' : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'}`}
                    >
                        Tudo
                    </button>
                    <button
                        onClick={() => setFilterType('income')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex-1 md:flex-none ${filterType === 'income' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'}`}
                    >
                        Entradas
                    </button>
                    <button
                        onClick={() => setFilterType('expense')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex-1 md:flex-none ${filterType === 'expense' ? 'bg-rose-500 text-black' : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'}`}
                    >
                        Saídas
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Total Entradas</p>
                    <p className="text-2xl font-black text-emerald-400">{formatCurrency(totals.income)}</p>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-[10px] uppercase font-bold text-rose-400 mb-1">Total Saídas</p>
                    <p className="text-2xl font-black text-rose-400">{formatCurrency(totals.expense)}</p>
                </div>
                <div className={`p-4 rounded-xl border ${totals.balance >= 0 ? 'bg-[var(--primary)]/10 border-[var(--primary)]/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${totals.balance >= 0 ? 'text-[var(--primary)]' : 'text-rose-400'}`}>Saldo do Período</p>
                    <p className={`text-2xl font-black ${totals.balance >= 0 ? 'text-[var(--primary)]' : 'text-rose-400'}`}>{formatCurrency(totals.balance)}</p>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Transações</h3>
                {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between p-3 bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg hover:border-[var(--primary)]/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {item.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{item.title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                                        <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                                        <span>•</span>
                                        <span className="uppercase">{item.category}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`font-mono font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.value)}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-[var(--text-muted)] italic">
                        Nenhuma transação encontrada neste período.
                    </div>
                )}
            </div>
        </div>
    );
};
