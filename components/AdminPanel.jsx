'use client';

import React, { useState } from 'react';
import { useHealth } from '../hooks/useHealth';
import {
    Database,
    Plus,
    Trash2,
    Search,
    Utensils,
    Dumbbell,
    Save,
    ChevronRight,
    SearchCode,
    Settings,
    Layout
} from 'lucide-react';

export const AdminPanel = () => {
    const { allNutritionData, addNutritionItem, removeNutritionItem, workoutPlan, updateWorkoutExercises } = useHealth();
    const [activeTab, setActiveTab] = useState('diet');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state for new food
    const [newFood, setNewFood] = useState({
        name: '',
        unit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    });

    const filteredNutrition = allNutritionData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddFood = (e) => {
        e.preventDefault();
        addNutritionItem(newFood);
        setNewFood({ name: '', unit: 'g', calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    return (
        <div className="pb-20 animate-fade-in">
            <header className="mb-8 p-6 glass-panel border-[var(--primary)] bg-[var(--primary)]/5">
                <div className="flex items-center gap-4 mb-2">
                    <Database className="text-[var(--primary)]" size={32} />
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Painel Administrativo</h1>
                </div>
                <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest uppercase">Content Management System /// v1.0.4</p>
            </header>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('diet')}
                    className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all ${activeTab === 'diet' ? 'bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(0,243,255,0.2)]' : 'glass-panel text-[var(--text-muted)] hover:text-white'}`}
                >
                    <Utensils size={20} /> Nutrição (Dieta)
                </button>
                <button
                    onClick={() => setActiveTab('workout')}
                    className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all ${activeTab === 'workout' ? 'bg-[var(--accent)] text-black shadow-[0_0_20px_rgba(147,51,234,0.2)]' : 'glass-panel text-[var(--text-muted)] hover:text-white'}`}
                >
                    <Dumbbell size={20} /> Exercícios (Treino)
                </button>
            </div>

            {activeTab === 'diet' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                type="text"
                                placeholder="BUSCAR ALIMENTO..."
                                className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] font-mono text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="glass-panel overflow-hidden">
                            <div className="bg-[var(--surface-highlight)] p-4 grid grid-cols-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                <span className="col-span-2">Alimento</span>
                                <span className="text-center">Kcal</span>
                                <span className="text-center">Prot</span>
                                <span className="text-center">Carb</span>
                                <span className="text-center">Gord</span>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto scrollbar-none divide-y divide-[var(--glass-border)]">
                                {filteredNutrition.map(item => (
                                    <div key={item.id} className="p-4 grid grid-cols-6 items-center text-sm group hover:bg-white/5 transition-colors">
                                        <div className="col-span-2">
                                            <p className="font-bold text-white truncate">{item.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase italic">Por {item.unit}</p>
                                        </div>
                                        <p className="text-center font-mono">{item.calories}</p>
                                        <p className="text-center font-mono text-[var(--primary)]">{item.protein}</p>
                                        <p className="text-center font-mono text-[var(--accent)]">{item.carbs}</p>
                                        <p className="text-center font-mono text-orange-400">{item.fats}</p>
                                        <div className="flex justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => removeNutritionItem(item.id)}
                                                className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New Item Form */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 border-[var(--primary)]">
                            <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Plus className="text-[var(--primary)]" size={18} /> Novo Alimento
                            </h2>
                            <form onSubmit={handleAddFood} className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Nome</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                                        placeholder="Ex: Whey Isolate"
                                        value={newFood.name}
                                        onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Unidade Base (Ex: 100g, 1 un)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                                        placeholder="Ex: 100g"
                                        value={newFood.unit}
                                        onChange={e => setNewFood({ ...newFood, unit: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Calorias</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                                            value={newFood.calories}
                                            onChange={e => setNewFood({ ...newFood, calories: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Proteínas (g)</label>
                                        <input
                                            required
                                            type="number" step="0.1"
                                            className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                                            value={newFood.protein}
                                            onChange={e => setNewFood({ ...newFood, protein: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Carbos (g)</label>
                                        <input
                                            required
                                            type="number" step="0.1"
                                            className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                                            value={newFood.carbs}
                                            onChange={e => setNewFood({ ...newFood, carbs: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Gorduras (g)</label>
                                        <input
                                            required
                                            type="number" step="0.1"
                                            className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--primary)] outline-none"
                                            value={newFood.fats}
                                            onChange={e => setNewFood({ ...newFood, fats: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[var(--primary)] hover:bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all mt-4"
                                >
                                    ADICIONAR AO BANCO
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel p-12 text-center opacity-50 border-dashed border-2">
                    <Dumbbell className="mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-black uppercase tracking-widest mb-2">Editor de Treinos</h2>
                    <p className="text-sm font-mono uppercase">Em desenvolvimento... /// Atualmente gerenciado via Geração Automática</p>
                </div>
            )}
        </div>
    );
};
