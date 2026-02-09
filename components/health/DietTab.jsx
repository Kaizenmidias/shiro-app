import React, { useState, useMemo } from 'react';
import { Utensils, RefreshCw, Plus, Edit2, Trash2, Check, X, Flame, Search, ChevronRight, Clock, AlertCircle, Droplets, Wheat, Beef } from 'lucide-react';
import { TimeInput } from '../ui/TimeInput';
import nutritionData from '../../data/nutritionData.json';

export const DietTab = ({ dietPlan, setDietPlan, generateDiet, mounted }) => {
    const [editingIdx, setEditingIdx] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [editForm, setEditForm] = useState({
        name: '',
        time: '12:00',
        items: [], // Array of { name, amount, unit, calSum, protein, carbs, fats, id }
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    });

    const foodResults = useMemo(() => {
        if (!searchTerm) return [];
        return nutritionData.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [searchTerm]);

    const handleEditMeal = (idx) => {
        const meal = dietPlan.meals[idx];
        setEditingIdx(idx);
        setEditForm({
            name: meal.name,
            time: meal.time || '12:00',
            items: Array.isArray(meal.items) ? [...meal.items.map(i => ({ ...i }))] : [],
            calories: meal.calories || 0,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fats: meal.fats || 0
        });
        setIsAdding(false);
        setSearchTerm('');
    };

    const handleAddItem = (food) => {
        const newItem = {
            id: food.id,
            name: food.name,
            amount: (food.unit === 'unidade' || food.unit.includes('fatia') || food.unit.includes('pote')) ? 1 : 100,
            unit: food.unit,
            calSum: food.calories,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fats: food.fats || 0
        };

        const updatedItems = [...editForm.items, newItem];
        updateFormTotals(updatedItems);
        setSearchTerm('');
    };

    const handleAddItemCustom = () => {
        if (!searchTerm.trim()) return;
        const newItem = {
            id: `custom_${Date.now()}`,
            name: searchTerm.trim(),
            amount: 100,
            unit: 'g',
            calSum: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };
        const updatedItems = [...editForm.items, newItem];
        updateFormTotals(updatedItems);
        setSearchTerm('');
    };

    const updateFormTotals = (items) => {
        const totals = items.reduce((acc, item) => ({
            calories: acc.calories + (parseFloat(item.calSum) || 0),
            protein: acc.protein + (parseFloat(item.protein) || 0),
            carbs: acc.carbs + (parseFloat(item.carbs) || 0),
            fats: acc.fats + (parseFloat(item.fats) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        setEditForm(prev => ({
            ...prev,
            items,
            ...totals
        }));
    };

    const handleUpdateItem = (itemIdx, field, value) => {
        const updatedItems = [...editForm.items];
        const item = { ...updatedItems[itemIdx], [field]: value };

        // Auto-recalculate macros if amount changes and it's from database
        if (field === 'amount' && item.id && !item.id.startsWith('custom_')) {
            const food = nutritionData.find(f => f.id === item.id);
            if (food) {
                const ratio = (food.unit === 'g' || food.unit.includes('100ml')) ? parseFloat(value) / 100 : parseFloat(value);
                item.calSum = Math.round(food.calories * ratio) || 0;
                item.protein = parseFloat((food.protein * ratio).toFixed(1)) || 0;
                item.carbs = parseFloat((food.carbs * ratio).toFixed(1)) || 0;
                item.fats = parseFloat((food.fats * ratio).toFixed(1)) || 0;
            }
        }

        updatedItems[itemIdx] = item;
        updateFormTotals(updatedItems);
    };

    const handleRemoveItem = (itemIdx) => {
        const updatedItems = editForm.items.filter((_, i) => i !== itemIdx);
        updateFormTotals(updatedItems);
    };

    const handleSaveMeal = () => {
        const updatedMeals = [...dietPlan.meals];
        const mealData = {
            name: editForm.name,
            time: editForm.time,
            items: editForm.items,
            calories: Math.round(editForm.calories),
            protein: parseFloat(editForm.protein.toFixed(1)),
            carbs: parseFloat(editForm.carbs.toFixed(1)),
            fats: parseFloat(editForm.fats.toFixed(1))
        };

        if (isAdding) {
            updatedMeals.push(mealData);
        } else {
            updatedMeals[editingIdx] = mealData;
        }

        setDietPlan({ ...dietPlan, meals: updatedMeals });
        setEditingIdx(null);
        setIsAdding(false);
    };

    const handleDeleteMeal = (idx) => {
        const updatedMeals = dietPlan.meals.filter((_, i) => i !== idx);
        setDietPlan({ ...dietPlan, meals: updatedMeals });
    };

    const currentTotalCalories = dietPlan?.meals?.reduce((sum, m) => sum + (parseInt(m.calories) || 0), 0) || 0;
    const averageCalories = dietPlan?.meals?.length > 0 ? Math.round(currentTotalCalories / dietPlan.meals.length) : 0;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {!dietPlan ? (
                <div className="glass-panel p-12 text-center">
                    <Utensils size={48} className="mx-auto mb-4 text-[var(--primary)] opacity-40" />
                    <h3 className="text-xl font-bold mb-2">Nenhuma dieta gerada</h3>
                    <p className="text-[var(--text-muted)] mb-6">Gere um plano baseado nos seus dados corporais.</p>
                    <button
                        onClick={generateDiet}
                        className="bg-[var(--primary)] hover:scale-105 active:scale-95 text-black px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_var(--primary-glow)] transition-all"
                    >
                        Gerar Plano Inicial
                    </button>
                </div>
            ) : (
                <>
                    {/* Header: Calories Summary */}
                    <div className="glass-panel p-6 bg-gradient-to-br from-[var(--primary-dim)]/10 to-transparent border-l-4 border-l-[var(--primary)]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Balanço Calórico Diário</p>
                                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                                    <div className="text-4xl font-black text-white leading-none">{currentTotalCalories} <span className="text-sm text-[var(--text-muted)] font-bold uppercase">Atual</span></div>
                                    <div className="text-xl font-bold text-[var(--primary)]/60">/ {dietPlan.calories} <span className="text-xs font-bold uppercase">Meta</span></div>
                                    <div className="bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block leading-none mb-1">Média / Prato</span>
                                        <span className="text-lg font-bold text-orange-400">{averageCalories} <span className="text-[10px]">kcal</span></span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={generateDiet} className="p-2 hover:bg-white/5 rounded-xl transition-colors group" title="Recalcular Meta">
                                <RefreshCw size={20} className="text-[var(--text-muted)] group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        {/* Macros Grid & Comparison */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center relative overflow-hidden group/macro">
                                    <div className="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-bold">Proteína</div>
                                    <div className="font-black text-emerald-400 text-lg">{Math.round(dietPlan.meals.reduce((sum, m) => sum + (m.protein || 0), 0))} <span className="text-[10px] opacity-60">/ {dietPlan.macros.protein}g</span></div>
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (dietPlan.meals.reduce((sum, m) => sum + (m.protein || 0), 0) / dietPlan.macros.protein) * 100)}%` }} />
                                </div>
                                <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center relative overflow-hidden group/macro">
                                    <div className="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-bold">Carbo</div>
                                    <div className="font-black text-amber-400 text-lg">{Math.round(dietPlan.meals.reduce((sum, m) => sum + (m.carbs || 0), 0))} <span className="text-[10px] opacity-60">/ {dietPlan.macros.carbs}g</span></div>
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(100, (dietPlan.meals.reduce((sum, m) => sum + (m.carbs || 0), 0) / dietPlan.macros.carbs) * 100)}%` }} />
                                </div>
                                <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-center relative overflow-hidden group/macro">
                                    <div className="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-bold">Gordura</div>
                                    <div className="font-black text-rose-500 text-lg">{Math.round(dietPlan.meals.reduce((sum, m) => sum + (m.fats || 0), 0))} <span className="text-[10px] opacity-60">/ {dietPlan.macros.fats}g</span></div>
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-rose-500 transition-all duration-1000" style={{ width: `${Math.min(100, (dietPlan.meals.reduce((sum, m) => sum + (m.fats || 0), 0) / dietPlan.macros.fats) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meal List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Utensils size={18} className="text-[var(--primary)]" />
                                Sugestão de Cardápio
                            </h3>
                            <button
                                onClick={() => { setIsAdding(true); setEditingIdx(-1); setEditForm({ name: '', time: '12:00', items: [], calories: 0, protein: 0, carbs: 0, fats: 0 }); }}
                                className="p-1.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-black rounded-lg transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="grid gap-3">
                            {dietPlan.meals.map((meal, idx) => (
                                <div key={idx} className={`glass-panel p-4 transition-all ${editingIdx === idx ? 'border-[var(--primary)]' : 'hover:border-white/10'}`}>
                                    {editingIdx === idx ? (
                                        <div className="space-y-4">
                                            {/* Meal Edit Header */}
                                            <div className="flex gap-2">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)] font-bold"
                                                        value={editForm.name}
                                                        placeholder="Nome da Refeição"
                                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                    <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
                                                        <Clock size={14} className="text-[var(--primary)] ml-1" />
                                                        <TimeInput
                                                            className="bg-transparent text-sm text-white focus:outline-none font-bold w-12 text-center"
                                                            value={editForm.time}
                                                            onChange={val => setEditForm({ ...editForm, time: val })}
                                                        />
                                                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Horário do Alarme</span>
                                                    </div>
                                                </div>
                                                <div className="w-24 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg p-2 text-center flex flex-col justify-center">
                                                    <span className="text-[10px] text-[var(--text-muted)] block uppercase leading-none mb-1">TOTAL kcal</span>
                                                    <span className="font-mono font-bold text-white leading-none">{Math.round(editForm.calories)}</span>
                                                </div>
                                            </div>

                                            {/* Item List in Editor */}
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                                {editForm.items.map((item, i) => (
                                                    <div key={i} className="bg-white/[0.03] p-4 rounded-xl border border-white/5 group/item hover:border-[var(--primary)]/30 transition-all">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="text-xs font-bold text-white/90">{item.name}</div>
                                                            <button onClick={() => handleRemoveItem(i)} className="p-1.5 hover:bg-rose-500/20 text-white/20 hover:text-rose-500 rounded-lg transition-all">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Qtd</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] focus:border-[var(--primary)] outline-none text-[var(--primary)] font-bold"
                                                                        value={item.amount}
                                                                        onChange={e => handleUpdateItem(i, 'amount', e.target.value)}
                                                                    />
                                                                    <select
                                                                        className="bg-transparent text-[10px] text-[var(--text-muted)] uppercase tracking-tighter font-bold focus:outline-none appearance-none cursor-pointer hover:text-white transition-colors text-right min-w-[30px]"
                                                                        value={item.unit === 'un' ? 'un' : (item.unit && item.unit.includes('ml') ? 'ml' : 'g')}
                                                                        onChange={e => handleUpdateItem(i, 'unit', e.target.value)}
                                                                    >
                                                                        <option value="g" className="bg-[#1a1c1e] text-white">G</option>
                                                                        <option value="ml" className="bg-[#1a1c1e] text-white">ML</option>
                                                                        <option value="un" className="bg-[#1a1c1e] text-white">UN</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Prot</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-emerald-400 focus:border-emerald-500 outline-none font-bold"
                                                                    value={item.protein}
                                                                    onChange={e => handleUpdateItem(i, 'protein', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Carb</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-amber-400 focus:border-amber-500 outline-none font-bold"
                                                                    value={item.carbs}
                                                                    onChange={e => handleUpdateItem(i, 'carbs', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Gord</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-rose-400 focus:border-rose-500 outline-none font-bold"
                                                                    value={item.fats}
                                                                    onChange={e => handleUpdateItem(i, 'fats', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex justify-end items-center gap-2">
                                                            <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Calorias</span>
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    className="w-16 bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-orange-400 focus:border-orange-500 outline-none font-bold text-right"
                                                                    value={item.calSum}
                                                                    onChange={e => handleUpdateItem(i, 'calSum', e.target.value)}
                                                                />
                                                                <span className="text-[10px] text-orange-400/60 font-bold">kcal</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Search Interface */}
                                            <div className="relative">
                                                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                                                    <Search size={14} className="text-[var(--text-muted)]" />
                                                    <input
                                                        className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-white/20"
                                                        placeholder="Pesquisar alimento..."
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                    />
                                                </div>

                                                {searchTerm && (
                                                    <div className="absolute top-full left-0 w-full mt-1 bg-[#1a1c1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5">
                                                        <button
                                                            onClick={handleAddItemCustom}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-[var(--primary)]/10 transition-colors group text-left border-b border-[var(--primary)]/20 shadow-[inset_0_0_10px_rgba(0,255,255,0.05)]"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                                                    <Plus size={16} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-[var(--primary)]">Novo: "{searchTerm}"</div>
                                                                    <div className="text-[10px] text-[var(--text-muted)] italic">Adicionar como item personalizado</div>
                                                                </div>
                                                            </div>
                                                            <ChevronRight size={14} className="text-[var(--primary)] opacity-40" />
                                                        </button>
                                                        {foodResults.map(food => (
                                                            <button
                                                                key={food.id}
                                                                onClick={() => handleAddItem(food)}
                                                                className="w-full flex items-center justify-between p-3 hover:bg-[var(--primary)]/10 transition-colors group text-left"
                                                            >
                                                                <div>
                                                                    <div className="text-sm font-medium text-white">{food.name}</div>
                                                                    <div className="text-[10px] text-[var(--text-muted)]">
                                                                        {food.category} • P: {food.protein}g C: {food.carbs}g G: {food.fats}g
                                                                    </div>
                                                                </div>
                                                                <Plus size={14} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                                <button onClick={() => setEditingIdx(null)} className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm font-medium text-[var(--text-muted)]">
                                                    <X size={16} /> Cancelar
                                                </button>
                                                <button onClick={handleSaveMeal} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-black rounded-lg transition-all text-sm font-bold shadow-[0_0_15px_var(--primary-glow)]/20">
                                                    <Check size={16} /> Salvar Refeição
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex flex-col">
                                                        <h4 className="font-bold text-[var(--primary-glow)] text-sm">{meal.name}</h4>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mt-0.5">
                                                            <Clock size={12} className="text-[var(--primary)]/60" />
                                                            <span className="font-bold tracking-tight text-white/40">{meal.time || '--:--'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="flex items-center gap-0.5 text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded-full text-emerald-400 font-bold border border-emerald-500/20">
                                                            P: {meal.protein}g
                                                        </span>
                                                        <span className="flex items-center gap-0.5 text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded-full text-amber-400 font-bold border border-amber-500/20">
                                                            C: {meal.carbs}g
                                                        </span>
                                                        <span className="flex items-center gap-0.5 text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded-full text-rose-400 font-bold border border-rose-500/20">
                                                            G: {meal.fats}g
                                                        </span>
                                                        <span className="flex items-center gap-0.5 text-[10px] bg-black/40 px-2 py-0.5 rounded-full text-orange-400 font-bold border border-white/5">
                                                            <Flame size={10} />
                                                            {meal.calories}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 mt-3 pl-1">
                                                    {Array.isArray(meal.items) ? (
                                                        meal.items.map((item, i) => (
                                                            <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-3 py-4 rounded-xl text-[13px] group/item hover:bg-white/[0.05] transition-colors border-l-2 border-l-transparent hover:border-l-[var(--primary)]">
                                                                <span className="text-[var(--primary)] font-bold min-w-[80px] shrink-0">
                                                                    {item.amount} {(() => {
                                                                        const u = item.unit.toLowerCase();
                                                                        const isPlural = item.amount > 1;
                                                                        if (u.includes('unidade')) return isPlural ? 'unidades' : 'unidade';
                                                                        if (u.includes('fatia')) return isPlural ? 'fatias' : 'fatia';
                                                                        if (u.includes('pote')) return isPlural ? 'potes' : 'pote';
                                                                        if (u.includes('colher')) return isPlural ? 'colheres' : 'colher';
                                                                        return item.unit;
                                                                    })()}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <div className="text-white/90 font-semibold leading-tight">{item.name}</div>
                                                                    <div className="flex gap-3 mt-1 text-[10px] font-bold opacity-60">
                                                                        <span className="text-emerald-400">P: {item.protein}g</span>
                                                                        <span className="text-amber-400">C: {item.carbs}g</span>
                                                                        <span className="text-rose-400">G: {item.fats}g</span>
                                                                    </div>
                                                                </div>
                                                                <span className="text-orange-400 font-bold opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    ({item.calSum} kcal)
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-[var(--text-muted)] text-sm line-clamp-2">{meal.items}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditMeal(idx)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteMeal(idx)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-rose-500 transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isAdding && editingIdx === -1 && (
                                <div className="glass-panel p-4 border-dashed border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)]/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <Plus size={14} className="text-[var(--primary)]" />
                                            Nova Refeição
                                        </h4>
                                        <button onClick={() => setIsAdding(false)} className="text-white/20 hover:text-rose-500 transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    autoFocus
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
                                                    value={editForm.name}
                                                    placeholder="Ex: Pós-Treino"
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                                <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5">
                                                    <Clock size={14} className="text-[var(--primary)] ml-1" />
                                                    <input
                                                        type="time"
                                                        className="bg-transparent text-sm text-white focus:outline-none font-bold [color-scheme:dark]"
                                                        value={editForm.time}
                                                        onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                                                    />
                                                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Horário</span>
                                                </div>
                                            </div>
                                            <div className="w-24 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-lg p-2 text-center flex flex-col justify-center">
                                                <span className="text-[10px] text-[var(--text-muted)] block uppercase leading-none mb-1">Total</span>
                                                <span className="font-mono font-bold text-white leading-none">{Math.round(editForm.calories)}</span>
                                            </div>
                                        </div>

                                        {/* Simplified view for new meal empty state */}
                                        {editForm.items.length === 0 ? (
                                            <div className="py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                                <Search size={24} className="mx-auto mb-2 text-white/10" />
                                                <p className="text-xs text-[var(--text-muted)] italic">Pesquise alimentos abaixo para começar</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {editForm.items.map((item, i) => (
                                                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-xs text-white font-bold">{item.name}</span>
                                                            <button onClick={() => handleRemoveItem(i)} className="p-1 hover:text-rose-500">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] uppercase text-[var(--text-muted)]">Qtd</span>
                                                                <div className="flex items-center bg-black/40 border border-white/10 rounded px-1 py-0.5">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-transparent text-[10px] text-center focus:outline-none"
                                                                        value={item.amount}
                                                                        onChange={e => handleUpdateItem(i, 'amount', e.target.value)}
                                                                    />
                                                                    <select
                                                                        className="bg-transparent text-[8px] text-[var(--text-muted)] uppercase font-bold focus:outline-none appearance-none cursor-pointer hover:text-white transition-colors text-right"
                                                                        value={item.unit === 'un' ? 'un' : (item.unit && item.unit.includes('ml') ? 'ml' : 'g')}
                                                                        onChange={e => handleUpdateItem(i, 'unit', e.target.value)}
                                                                    >
                                                                        <option value="g" className="bg-[#1a1c1e] text-white">G</option>
                                                                        <option value="ml" className="bg-[#1a1c1e] text-white">ML</option>
                                                                        <option value="un" className="bg-[#1a1c1e] text-white">UN</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] uppercase text-emerald-500/60">P</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-center text-emerald-400"
                                                                    value={item.protein}
                                                                    onChange={e => handleUpdateItem(i, 'protein', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] uppercase text-amber-500/60">C</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-center text-amber-400"
                                                                    value={item.carbs}
                                                                    onChange={e => handleUpdateItem(i, 'carbs', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] uppercase text-rose-500/60">G</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-center text-rose-400"
                                                                    value={item.fats}
                                                                    onChange={e => handleUpdateItem(i, 'fats', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex justify-end items-center gap-2">
                                                            <span className="text-[8px] uppercase text-[var(--text-muted)] font-bold">Calorias</span>
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    className="w-14 bg-black/60 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-orange-400 focus:border-orange-500 outline-none font-bold text-right"
                                                                    value={item.calSum}
                                                                    onChange={e => handleUpdateItem(i, 'calSum', e.target.value)}
                                                                />
                                                                <span className="text-[9px] text-orange-400/60 font-bold">kcal</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="relative">
                                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                                                <Search size={14} className="text-[var(--text-muted)]" />
                                                <input
                                                    className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-white/20"
                                                    placeholder="Pesquisar alimento..."
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            {searchTerm && (
                                                <div className="absolute bottom-full left-0 w-full mb-1 bg-[#1a1c1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5">
                                                    <button
                                                        onClick={handleAddItemCustom}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-[var(--primary)]/10 transition-colors group text-left border-b border-[var(--primary)]/20"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Plus size={14} className="text-[var(--primary)]" />
                                                            <div>
                                                                <div className="text-sm font-bold text-[var(--primary)]">Novo: "{searchTerm}"</div>
                                                                <div className="text-[10px] text-[var(--text-muted)]">Personalizado</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    {foodResults.map(food => (
                                                        <button
                                                            key={food.id}
                                                            onClick={() => handleAddItem(food)}
                                                            className="w-full flex items-center justify-between p-3 hover:bg-[var(--primary)]/10 transition-colors group text-left"
                                                        >
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{food.name}</div>
                                                                <div className="text-[10px] text-[var(--text-muted)]">
                                                                    {food.category} • P: {food.protein}g C: {food.carbs}g G: {food.fats}g
                                                                </div>
                                                            </div>
                                                            <Plus size={14} className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={handleSaveMeal} className="w-full py-3 bg-[var(--primary)] text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_var(--primary-glow)]/40">
                                            Criar Refeição
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
