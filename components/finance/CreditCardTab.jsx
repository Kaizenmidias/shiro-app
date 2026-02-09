'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Plus, X, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CurrencyInput } from './CurrencyInput';

export const CreditCardTab = ({ cards, addCardPurchase, removeCardPurchase, payInstallment }) => {
    const { formatCurrency } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPurchase, setNewPurchase] = useState({ title: '', value: 0, installments: 1 });
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newPurchase.title || newPurchase.value <= 0) return;
        addCardPurchase({
            ...newPurchase,
            installments: parseInt(newPurchase.installments)
        });
        setNewPurchase({ title: '', value: 0, installments: 1 });
        setIsModalOpen(false);
    };

    // Navigation
    const nextMonth = () => {
        const next = new Date(selectedDate);
        next.setMonth(next.getMonth() + 1);
        setSelectedDate(next);
    };

    const prevMonth = () => {
        const prev = new Date(selectedDate);
        prev.setMonth(prev.getMonth() - 1);
        setSelectedDate(prev);
    };

    const isCurrentMonth = () => {
        const now = new Date();
        return selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear();
    };

    // Calculation Logic
    const getCardInfoForMonth = (card, date) => {
        // Fallback: If no createdAt, assume start date based on paid installments (assuming 1 per month history)
        // or just default to current date if brand new.
        // Ideally backend provides createdAt.
        let startDate = card.createdAt ? new Date(card.createdAt) : new Date();
        
        // If no createdAt, try to approximate: today minus paid installments months
        if (!card.createdAt && card.paidInstallments > 0) {
            startDate = new Date();
            startDate.setDate(1); // Avoid month rollover issues
            startDate.setMonth(startDate.getMonth() - card.paidInstallments);
        }

        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();
        const targetMonth = date.getMonth();
        const targetYear = date.getFullYear();

        const monthDiff = (targetYear - startYear) * 12 + (targetMonth - startMonth);
        
        // Installment number corresponding to this month (1-based)
        const installmentNumber = monthDiff + 1;

        const isActive = installmentNumber > 0 && installmentNumber <= card.installments;
        
        const installmentValue = card.value / card.installments;

        // Determine status
        let status = 'pending'; // pending, paid, future
        if (card.paidInstallments >= installmentNumber) {
            status = 'paid';
        } else if (installmentNumber > card.installments) {
            status = 'completed'; // Should not happen if !isActive
        }

        // Special check for "Current Month" real status
        // If we are viewing the actual current month, we check paidThisMonth flag for the *current* installment
        if (isCurrentMonth() && isActive) {
            // If the calculated installment is the *next* one to be paid (paidInstallments + 1)
            // And paidThisMonth is true, then it is paid.
            // Actually, paidThisMonth implies the *current pending* installment was paid.
            if (card.paidThisMonth && card.paidInstallments === installmentNumber) {
                 status = 'paid';
            }
        }

        return {
            isActive,
            installmentNumber,
            installmentValue,
            status
        };
    };

    // Filter cards for display
    const activeCards = cards.map(card => {
        const info = getCardInfoForMonth(card, selectedDate);
        return { ...card, ...info };
    }).filter(c => c.isActive);

    const totalForMonth = activeCards.reduce((sum, c) => sum + c.installmentValue, 0);

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            
            {/* Month Selector & Summary */}
            <div className="glass-panel p-6 border-[var(--primary)]/20 bg-gradient-to-r from-[var(--surface-color)] to-[var(--surface-highlight)]">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                            <Calendar size={20} className="text-[#f97316]" />
                            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h2>
                        {isCurrentMonth() && (
                            <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest bg-[#f97316]/10 px-2 py-0.5 rounded-full border border-[#f97316]/20">Mês Atual</span>
                        )}
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="text-center">
                    <span className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-widest">Total da Fatura</span>
                    <h3 className="text-4xl font-black text-white mt-1 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                        {formatCurrency(totalForMonth)}
                    </h3>
                </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
                {activeCards.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[var(--glass-border)] rounded-2xl opacity-50">
                        <CreditCard size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">Nenhuma fatura para este mês</p>
                    </div>
                ) : (
                    activeCards.map(card => (
                        <div key={card.id} className="glass-panel p-6 border-[var(--glass-border)] hover:border-[#f97316] transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                                        <CreditCard size={20} className="text-[#f97316]" />
                                        {card.title || card.name}
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] font-mono mt-1">
                                        Parcela: {formatCurrency(card.installmentValue)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-[#f97316]/20 text-[#f97316] px-3 py-1 rounded-full uppercase font-bold border border-[#f97316]/30 block mb-2">
                                        {card.installmentNumber}/{card.installments}
                                    </span>
                                    {card.status === 'paid' ? (
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> PAGO
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1 justify-end">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" /> PENDENTE
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4 relative z-10">
                                <div className="w-full bg-[var(--surface-color)] h-2 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="bg-gradient-to-r from-[#f97316] to-[#fb923c] h-full transition-all duration-500"
                                        style={{ width: `${(card.paidInstallments / card.installments) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Only show action buttons if it's the current month and not paid */}
                            {isCurrentMonth() && card.status !== 'paid' && (
                                <button
                                    onClick={() => payInstallment(card.id)}
                                    className="w-full mt-2 text-sm py-3 rounded-lg bg-[var(--surface-highlight)] hover:bg-[#f97316]/20 text-[#f97316] border border-transparent hover:border-[#f97316] font-bold uppercase tracking-wider transition-all"
                                >
                                    Pagar Parcela do Mês
                                </button>
                            )}
                            
                            {/* Allow delete always (maybe restricted?) - Keeping it simple */}
                            <button
                                onClick={() => removeCardPurchase(card.id)}
                                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-2 bg-black/50 rounded-full"
                                title="Excluir Compra"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 bg-[#f97316] text-white p-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* Modal Form */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 border-[#f97316] animate-fade-in shadow-[0_0_50px_rgba(249,115,22,0.15)] relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="text-[#f97316]">/// NOVA</span> COMPRA NO CARTÃO
                        </h3>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Descrição da Compra</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Celular, Amazon, Supermercado..."
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[#f97316]"
                                    value={newPurchase.title}
                                    onChange={e => setNewPurchase({ ...newPurchase, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Valor Total</label>
                                    <CurrencyInput
                                        value={newPurchase.value}
                                        onChange={val => setNewPurchase({ ...newPurchase, value: val })}
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[#f97316]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Parcelamento</label>
                                    <select
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[#f97316]"
                                        value={newPurchase.installments}
                                        onChange={e => setNewPurchase({ ...newPurchase, installments: e.target.value })}
                                    >
                                        <option value="1">À vista</option>
                                        {[2, 3, 4, 5, 6, 10, 12, 18, 24].map(i => <option key={i} value={i}>{i}x Parcelas</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-lg bg-[#f97316] text-white font-bold text-sm shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all uppercase tracking-wider mt-4"
                            >
                                Adicionar Compra
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
