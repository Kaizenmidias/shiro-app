'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, Plus, X, Trash2 } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CurrencyInput } from './CurrencyInput';

export const CreditCardTab = ({ cards, addCardPurchase, removeCardPurchase, payInstallment }) => {
    const { formatCurrency } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPurchase, setNewPurchase] = useState({ title: '', value: 0, installments: 1 });
    const [mounted, setMounted] = useState(false);

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

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            <div className="space-y-4">
                {cards.map(card => {
                    const isPaidOff = card.paidInstallments >= card.installments;
                    return (
                        <div key={card.id} className={`glass-panel p-6 border-[var(--glass-border)] hover:border-[#f97316] transition-all group relative overflow-hidden ${isPaidOff ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                                        <CreditCard size={20} className="text-[#f97316]" />
                                        {card.name}
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] font-mono mt-1">Total: {formatCurrency(card.value)}</p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <span className="text-xs bg-[#f97316]/20 text-[#f97316] px-3 py-1 rounded-full uppercase font-bold border border-[#f97316]/30">
                                        {card.installments === 1 ? 'À vista' : `${card.installments}x`}
                                    </span>
                                    <button
                                        onClick={() => removeCardPurchase(card.id)}
                                        className="text-[var(--text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                        title="Excluir Compra"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 relative z-10">
                                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2 font-mono uppercase">
                                    <span>Progresso</span>
                                    <span>{card.paidInstallments}/{card.installments}</span>
                                </div>
                                <div className="w-full bg-[var(--surface-color)] h-3 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="bg-gradient-to-r from-[#f97316] to-[#fb923c] h-full transition-all duration-500 relative"
                                        style={{ width: `${(card.paidInstallments / card.installments) * 100}%` }}
                                    >
                                        <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[2px]" />
                                    </div>
                                </div>
                            </div>

                            {!isPaidOff && (
                                <div className="space-y-2">
                                    {card.paidThisMonth && (
                                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 w-fit px-3 py-1 rounded-full border border-emerald-400/20 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Parcela do mês paga
                                        </div>
                                    )}
                                    <button
                                        onClick={() => payInstallment(card.id)}
                                        className={`w-full mt-2 text-sm py-3 rounded-lg border transition-all relative z-10 font-bold uppercase tracking-wider ${card.paidThisMonth
                                            ? 'bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-[#f97316] hover:text-[#f97316]'
                                            : 'bg-[var(--surface-highlight)] hover:bg-[#f97316]/20 text-[#f97316] border-transparent hover:border-[#f97316]'
                                            }`}
                                    >
                                        {card.paidThisMonth ? 'Antecipar Próxima Parcela' : 'Pagar Parcela do Mês'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
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
                                        {[2, 3, 4, 5, 6, 10, 12].map(i => <option key={i} value={i}>{i}x Parcelas</option>)}
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
