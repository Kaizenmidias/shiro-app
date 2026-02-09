'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Check, DollarSign, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CurrencyInput } from './CurrencyInput';

export const ExpensesTab = ({ expenses, addExpense, toggleExpensePaid, removeExpense }) => {
    const { formatCurrency } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', value: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalMonthly = expenses.reduce((sum, exp) => sum + exp.value, 0);
    const totalPaid = expenses.filter(exp => exp.paid).reduce((sum, exp) => sum + exp.value, 0);
    const remaining = totalMonthly - totalPaid;

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newExpense.name || newExpense.value <= 0) return;
        addExpense({ ...newExpense });
        setNewExpense({ name: '', value: 0 });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in font-poppins pb-32">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 border-b-2 border-b-[var(--primary)] text-center bg-gradient-to-t from-[var(--primary)]/5 to-transparent">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest block mb-1">Total Mensal</span>
                    <h4 className="text-xl font-black text-white">{formatCurrency(totalMonthly)}</h4>
                </div>
                <div className="glass-panel p-4 border-b-2 border-b-emerald-500 text-center bg-gradient-to-t from-emerald-500/5 to-transparent">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest block mb-1">Total Pago</span>
                    <h4 className="text-xl font-black text-emerald-400">{formatCurrency(totalPaid)}</h4>
                </div>
                <div className="glass-panel p-4 border-b-2 border-b-rose-500 text-center bg-gradient-to-t from-rose-500/5 to-transparent">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest block mb-1">Restante</span>
                    <h4 className="text-xl font-black text-rose-400">{formatCurrency(remaining)}</h4>
                </div>
            </div>

            <div className="space-y-3">
                {expenses.map(exp => (
                    <div key={exp.id} className={`glass-panel p-5 flex items-center justify-between border-[var(--glass-border)] hover:border-[var(--primary-dim)] transition-colors group ${exp.paid ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleExpensePaid(exp.id)}
                                className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${exp.paid
                                    ? 'bg-green-500 border-green-500 text-black shadow-[0_0_10px_#00ff00]'
                                    : 'border-[var(--text-muted)] hover:border-green-400 bg-transparent text-transparent hover:text-green-400'
                                    }`}
                            >
                                <Check size={16} strokeWidth={3} />
                            </button>
                            <div>
                                <h3 className={`font-medium text-lg flex items-center gap-2 ${exp.paid ? 'line-through text-[var(--text-muted)]' : 'text-white'}`}>
                                    {exp.name}
                                </h3>
                                <p className="text-sm font-mono text-[var(--text-muted)] flex items-center gap-1">
                                    {formatCurrency(exp.value)}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => removeExpense(exp.id)} className="text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                {expenses.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-[var(--glass-border)] rounded-2xl opacity-50">
                        <DollarSign size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">Nenhuma despesa fixa</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 bg-[var(--primary)] text-black p-4 rounded-xl shadow-[0_0_20px_var(--primary-glow)] hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* Modal Form */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 border-[var(--primary)] animate-fade-in shadow-[0_0_50px_rgba(0,243,255,0.15)] relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="text-[var(--primary)]">/// NOVA</span> DESPESA
                        </h3>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Nome da Despesa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Aluguel, Internet..."
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[var(--primary)]"
                                    value={newExpense.name}
                                    onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Valor Mensal</label>
                                <CurrencyInput
                                    value={newExpense.value}
                                    onChange={val => setNewExpense({ ...newExpense, value: val })}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-lg bg-[var(--primary)] text-black font-bold text-sm shadow-[0_0_15px_var(--primary-glow)] hover:shadow-[0_0_25px_var(--primary-glow)] transition-all uppercase tracking-wider mt-4"
                            >
                                Adicionar Despesa
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
