'use client';

import React, { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { CurrencyInput } from './CurrencyInput';

export const ReserveTab = ({ reserve, updateReserve, setReserveGoal }) => {
    const { formatCurrency } = useGame();
    const [addAmount, setAddAmount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [goalForm, setGoalForm] = useState({ goal: reserve.goal, deadline: reserve.deadline });

    const handleAdd = (e) => {
        e.preventDefault();
        if (addAmount <= 0) return;
        updateReserve(reserve.current + addAmount);
        setAddAmount(0);
    };

    const handleSaveGoal = () => {
        setReserveGoal(parseFloat(goalForm.goal), parseInt(goalForm.deadline));
        setIsEditing(false);
    };

    const handleReset = () => {
        if (window.confirm("Deseja realmente ZERAR sua reserva financeira? Esta ação não pode ser desfeita.")) {
            updateReserve(0);
        }
    };

    const monthlyNeeded = (reserve.goal - reserve.current) / reserve.deadline;
    const progress = Math.min((reserve.current / reserve.goal) * 100, 100);

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in pb-32">
            <div className="glass-panel p-6 md:p-8 relative overflow-hidden border-[#4ade80]/30 shadow-[0_0_30px_rgba(74,222,128,0.05)]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#4ade80]/5 to-transparent pointer-events-none" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h3 className="text-[#4ade80] text-xs md:text-sm mb-2 uppercase tracking-widest font-bold">Reserva Total</h3>
                        <div className="text-3xl md:text-5xl font-bold text-white tracking-tighter" style={{ textShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
                            {formatCurrency(reserve.current)}
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="p-3 md:p-4 bg-[#4ade80]/10 rounded-2xl border border-[#4ade80]/20 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 transition-all group"
                        title="Zerar Reserva"
                    >
                        <PiggyBank size={24} className="group-hover:scale-110 md:w-8 md:h-8" />
                    </button>
                </div>

                <div className="mb-6 relative z-10">
                    <div className="flex justify-between text-[10px] md:text-xs text-[var(--text-muted)] mb-2 font-mono">
                        <span>META: {formatCurrency(reserve.goal)}</span>
                        <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[var(--surface-color)] h-3 md:h-4 rounded-full overflow-hidden border border-white/5 relative">
                        <div
                            className="bg-[#4ade80] h-full transition-all duration-1000 relative shadow-[0_0_15px_#4ade80]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>

                <p className="text-xs md:text-sm text-[var(--text-muted)] relative z-10">
                    Plano: <span className="text-white">{reserve.deadline} meses</span>
                    <br />
                    Depósito Mensal: <strong className="text-[#4ade80] text-base md:text-lg">{formatCurrency(Math.max(0, monthlyNeeded))}</strong>
                </p>

                {isEditing ? (
                    <div className="mt-6 pt-6 border-t border-[var(--glass-border)] grid grid-cols-2 gap-3 relative z-10">
                        <div className="col-span-1">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-1 block">Nova Meta</label>
                            <CurrencyInput
                                value={goalForm.goal}
                                onChange={val => setGoalForm({ ...goalForm, goal: val })}
                                className="w-full bg-[var(--surface-color)] rounded-lg p-3 text-white text-xs md:text-sm border border-[var(--glass-border)] focus:border-[#4ade80] outline-none"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-1 block">Meses</label>
                            <input
                                type="number"
                                value={goalForm.deadline}
                                onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })}
                                className="w-full bg-[var(--surface-color)] rounded-lg p-3 text-white text-xs md:text-sm border border-[var(--glass-border)] focus:border-[#4ade80] outline-none"
                            />
                        </div>
                        <button onClick={handleSaveGoal} className="col-span-2 bg-[#4ade80] hover:bg-[#22c55e] rounded-lg p-3 text-black font-bold uppercase tracking-wider text-[10px] md:text-xs transition-colors">
                            Salvar Nova Meta
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-[10px] md:text-xs text-[var(--text-muted)] hover:text-white underline mt-4 relative z-10">
                        Ajustar Planejamento
                    </button>
                )}
            </div>

            <form onSubmit={handleAdd} className="glass-panel p-4 md:p-6 flex gap-3 border-[#4ade80]/30">
                <CurrencyInput
                    value={addAmount}
                    onChange={setAddAmount}
                    placeholder="Valor para depositar..."
                    className="flex-1 bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 md:p-4 text-white focus:outline-none focus:border-[#4ade80] focus:shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                />
                <button type="submit" className="bg-[#4ade80] px-4 md:px-6 rounded-lg text-black hover:bg-[#22c55e] font-bold uppercase tracking-wide shadow-[0_0_15px_rgba(74,222,128,0.4)] transition-all text-xs md:text-sm">
                    Depositar
                </button>
            </form>
        </div>
    );
};
