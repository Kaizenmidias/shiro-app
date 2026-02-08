'use client';

import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { Plus, Check, Trash2, Target } from 'lucide-react';

const GoalCard = ({ goal, onToggle, onDelete }) => {
    return (
        <div
            className={`glass-panel p-4 md:p-5 mb-3 flex items-center justify-between group border-[var(--glass-border)] hover:border-[var(--primary-glow)] transition-all ${goal.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
        >
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <button
                    onClick={() => onToggle(goal.id)}
                    className={`w-5 h-5 md:w-6 md:h-6 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-300 ${goal.completed
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-[0_0_10px_var(--primary)]'
                        : 'border-[var(--text-muted)] hover:border-[var(--primary)] bg-transparent'
                        }`}
                >
                    {goal.completed && <Check size={12} strokeWidth={4} />}
                </button>
                <div className="min-w-0">
                    <h3 className={`font-medium text-sm md:text-lg leading-tight transition-all truncate pr-2 ${goal.completed ? 'line-through text-[var(--text-muted)]' : 'text-white group-hover:text-[var(--primary)]'}`}>
                        {goal.title}
                    </h3>
                    {goal.description && <p className="text-xs text-[var(--text-muted)] mt-0.5 md:mt-1 font-mono truncate">{goal.description}</p>}
                </div>
            </div>
            <button
                onClick={() => onDelete(goal.id)}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all flex-shrink-0 p-2"
            >
                <Trash2 size={16} className="md:w-[18px]" />
            </button>
        </div>
    );
};

export const GoalsList = ({ type, title, points }) => {
    const { goals, addGoal, toggleGoal, removeGoal } = useGoals();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', type: type });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newGoal.title.trim()) return;
        addGoal({ ...newGoal, type: type });
        setNewGoal({ title: '', description: '', type: type });
        setIsModalOpen(false);
    };

    const filteredGoals = goals.filter(g => g.type === type);

    return (
        <div className="pb-20 animate-fade-in">
            <div className="mb-6 flex items-baseline gap-3">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <span className="text-xs font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded">+{points} {points === 1 ? 'PONTO' : 'PONTOS'}</span>
            </div>

            <div className="space-y-3 md:space-y-4 min-h-[50vh]">
                {filteredGoals.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-[var(--glass-border)] rounded-2xl opacity-50 mx-2">
                        <Target size={40} className="mx-auto mb-4 text-[var(--text-muted)] md:w-12 md:h-12" />
                        <p className="font-mono text-xs md:text-sm text-[var(--text-muted)]">SEM MISSÕES ATIVAS</p>
                    </div>
                ) : (
                    filteredGoals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onToggle={toggleGoal}
                            onDelete={removeGoal}
                        />
                    ))
                )}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-6 md:bottom-12 md:right-12 bg-[var(--primary)] hover:bg-white text-black p-3 md:p-4 rounded-xl shadow-[0_0_20px_var(--primary-glow)] transition-all active:scale-95 hover:scale-110 z-40"
            >
                <Plus size={24} strokeWidth={2.5} className="md:w-7 md:h-7" />
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-panel w-full max-w-lg p-6 md:p-8 relative border-[var(--primary)] shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-transparent" />

                        <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                            <span className="text-[var(--primary)]">///</span> NOVA META
                            <span className="text-[10px] bg-[var(--surface-highlight)] px-2 py-1 rounded text-[var(--text-muted)] ml-auto uppercase">{title}</span>
                        </h2>

                        <form onSubmit={handleAdd}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-[var(--primary)] font-mono uppercase mb-2 block">Título da Missão</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 md:p-4 text-white focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all text-sm md:text-base"
                                        value={newGoal.title}
                                        onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block">Detalhes (Opcional)</label>
                                    <textarea
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 md:p-4 text-white focus:outline-none focus:border-[var(--primary)] h-24 md:h-32 resize-none text-sm md:text-base"
                                        value={newGoal.description}
                                        onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 md:py-4 rounded-lg border border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-[var(--surface-highlight)] transition-colors uppercase font-bold text-xs md:text-sm tracking-wide"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 md:py-4 rounded-lg bg-[var(--primary)] text-black font-bold shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all uppercase text-xs md:text-sm tracking-wide"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
