'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, ShoppingCart, CheckCircle2, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CurrencyInput } from './CurrencyInput';

export const ShoppingTab = ({ shoppingList, addItemToShop, toggleShopItem, removeShopItem }) => {
    const { formatCurrency } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', value: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.name) return;
        addItemToShop({ ...newItem, value: newItem.value || 0 });
        setNewItem({ name: '', value: 0 });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            <div className="space-y-3">
                {shoppingList.map(item => (
                    <div key={item.id} className="glass-panel p-5 flex items-center justify-between border-[var(--glass-border)] hover:border-[#a855f7] transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full border-2 border-[#a855f7] bg-[#a855f7] text-black shadow-[0_0_10px_#a855f7] flex items-center justify-center">
                                <CheckCircle2 size={14} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white uppercase tracking-wider text-xs">{item.name}</h3>
                                <p className="text-sm font-mono text-[var(--text-muted)]">{item.value ? formatCurrency(item.value) : '-'}</p>
                            </div>
                        </div>
                        <button onClick={() => removeShopItem(item.id)} className="text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                {shoppingList.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-[var(--glass-border)] rounded-2xl opacity-50">
                        <ShoppingCart size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">Carrinho vazio</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 bg-[#a855f7] text-white p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {/* Modal Form */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 border-[#a855f7] animate-fade-in shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="text-[#a855f7]">/// NOVO</span> ITEM
                        </h3>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">O que comprar?</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Teclado, Monitor, Café..."
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[#a855f7]"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Valor Estimado</label>
                                <CurrencyInput
                                    value={newItem.value}
                                    onChange={val => setNewItem({ ...newItem, value: val })}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-4 text-white focus:outline-none focus:border-[#a855f7]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-lg bg-[#a855f7] text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all uppercase tracking-wider mt-4"
                            >
                                Adicionar ao Carrinho
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
