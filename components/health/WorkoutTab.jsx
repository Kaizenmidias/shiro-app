'use client';

import React, { useState, useMemo } from 'react';
import { Dumbbell, Calendar, CheckCircle2, Circle, Plus, Trash2, Edit2, ChevronRight, ChevronLeft, Info, RefreshCw, X, Save, ArrowUp, ArrowDown } from 'lucide-react';

export const WorkoutTab = ({ workoutPlan, setWorkoutPlan, generateWorkout, toggleExercise, renameWorkout, updateWorkoutExercises }) => {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const [selectedDay, setSelectedDay] = useState(() => {
        const todayIdx = (new Date().getDay() + 6) % 7; // Sunday is 0 in JS
        return days[todayIdx];
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editType, setEditType] = useState('A'); // 'A' or 'B'
    const [editExercises, setEditExercises] = useState([]);
    const [editName, setEditName] = useState('');

    const [showFreqSelector, setShowFreqSelector] = useState(!workoutPlan || !workoutPlan.schedule);
    const [tempFreq, setTempFreq] = useState(3);

    // Sync showFreqSelector with workoutPlan prop when it loads
    React.useEffect(() => {
        if (workoutPlan && workoutPlan.schedule) {
            setShowFreqSelector(false);
        }
    }, [workoutPlan]);

    // Derived data for the current view
    const currentWorkoutType = workoutPlan?.schedule?.[selectedDay];
    const currentWorkout = (currentWorkoutType && workoutPlan?.workouts?.[currentWorkoutType]) ? workoutPlan.workouts[currentWorkoutType] : null;

    // Date key for completions (e.g., "2026-02-08")
    const todayStr = new Date().toISOString().split('T')[0];

    const handleToggle = (idx) => {
        if (!currentWorkoutType || currentWorkoutType === 'Descanso') return;
        toggleExercise(todayStr, currentWorkoutType, idx);
    };

    const isCompleted = (idx) => {
        return workoutPlan?.completedData?.[todayStr]?.[currentWorkoutType]?.includes(idx);
    };

    const startEditing = (type) => {
        setEditType(type);
        setEditExercises([...workoutPlan.workouts[type].exercises]);
        setEditName(workoutPlan.workouts[type].name);
        setIsEditing(true);
    };

    const saveEdit = () => {
        renameWorkout(editType, editName);
        updateWorkoutExercises(editType, editExercises);
        setIsEditing(false);
    };

    const addExercise = () => {
        setEditExercises([...editExercises, { name: 'Novo Exercício', sets: '3', reps: '12', completed: false }]);
    };

    const removeExercise = (idx) => {
        setEditExercises(editExercises.filter((_, i) => i !== idx));
    };

    const moveExercise = (idx, direction) => {
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= editExercises.length) return;
        const newList = [...editExercises];
        const temp = newList[idx];
        newList[idx] = newList[newIdx];
        newList[newIdx] = temp;
        setEditExercises(newList);
    };

    const updateExerciseValue = (idx, field, value) => {
        const newList = [...editExercises];
        newList[idx] = { ...newList[idx], [field]: value };
        setEditExercises(newList);
    };

    if (showFreqSelector) {
        return (
            <div className="glass-panel p-8 text-center animate-fade-in shadow-[0_0_50px_rgba(0,238,244,0.1)]">
                <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--primary)] shadow-[0_0_20px_var(--primary-glow)]/30">
                    <Dumbbell size={32} />
                </div>
                <h3 className="text-xl font-black mb-2 text-white uppercase tracking-wider font-poppins">Configurar Seu Treino</h3>
                <p className="text-[var(--text-muted)] mb-8 text-sm max-w-xs mx-auto">
                    Vou gerar um treino baseado no seu **perfil** (idade, sexo e objetivo).
                </p>

                <div className="space-y-4 max-w-sm mx-auto">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-black block mb-4">Dias de treino por semana</span>
                        <div className="grid grid-cols-5 gap-2">
                            {[3, 4, 5, 6, 7].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setTempFreq(num)}
                                    className={`py-3 rounded-lg font-black transition-all border ${tempFreq === num
                                        ? 'bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)]/50'
                                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            generateWorkout(tempFreq);
                            setShowFreqSelector(false);
                        }}
                        className="w-full bg-[var(--primary)] text-black py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_var(--primary-glow)]/40"
                    >
                        Gerar Meu Treino
                    </button>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                    <button onClick={() => setIsEditing(false)} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-lg">
                        <X size={20} />
                    </button>
                    <div className="flex-1 px-4">
                        <input
                            className="w-full bg-transparent border-b-2 border-[var(--primary)]/20 text-center text-white font-black uppercase tracking-widest focus:outline-none focus:border-[var(--primary)] pb-1 text-lg"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            placeholder="NOME DO TREINO"
                        />
                    </div>
                    <button onClick={saveEdit} className="p-2 bg-[var(--primary)] text-black rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_var(--primary-glow)]/30">
                        <Save size={20} />
                    </button>
                </div>

                <div className="space-y-3 pb-32">
                    {editExercises.map((ex, idx) => (
                        <div key={idx} className="glass-panel p-4 space-y-3 relative group border-l-2 border-l-[var(--primary)]/20">
                            <div className="flex gap-3">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveExercise(idx, -1)}
                                        disabled={idx === 0}
                                        className="p-1.5 bg-white/5 rounded-md hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-inherit"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => moveExercise(idx, 1)}
                                        disabled={idx === editExercises.length - 1}
                                        className="p-1.5 bg-white/5 rounded-md hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-inherit"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input
                                        className="w-full bg-transparent border-b border-white/10 text-white font-bold focus:outline-none focus:border-[var(--primary)] pb-1"
                                        value={ex.name}
                                        onChange={e => updateExerciseValue(idx, 'name', e.target.value)}
                                        placeholder="Nome do exercício"
                                    />
                                    <div className="flex gap-4">
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Séries</span>
                                            <input
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[var(--primary)] outline-none"
                                                value={ex.sets}
                                                onChange={e => updateExerciseValue(idx, 'sets', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Reps</span>
                                            <input
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-[var(--primary)] outline-none"
                                                value={ex.reps}
                                                onChange={e => updateExerciseValue(idx, 'reps', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeExercise(idx)}
                                    className="p-1.5 h-fit bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={addExercise}
                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-white/40 hover:text-white hover:border-[var(--primary)]/40 transition-all flex items-center justify-center gap-2 font-bold bg-white/5"
                    >
                        <Plus size={18} /> Adicionar Exercício
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in font-poppins pb-24">
            {/* Weekly Calendar */}
            <div className="grid grid-cols-7 gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                {days.map(day => {
                    const type = workoutPlan?.schedule?.[day];
                    const wName = (type && workoutPlan?.workouts?.[type]) ? workoutPlan.workouts[type].name : 'Descanso';

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`flex flex-col items-center py-2.5 px-0.5 rounded-xl transition-all relative overflow-hidden ${selectedDay === day
                                ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/30'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <span className={`text-[9px] uppercase font-black mb-1.5 ${selectedDay === day ? 'text-[var(--primary)]' : 'text-white/30'}`}>
                                {day.slice(0, 3)}
                            </span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] mb-1.5 ${selectedDay === day
                                ? 'bg-[var(--primary)] text-black'
                                : type === 'Descanso' ? 'text-white/10' : 'text-white/40'
                                }`}>
                                {type === 'Descanso' ? <Calendar size={10} /> : type}
                            </div>
                            <span className={`text-[7px] uppercase font-bold text-center leading-none px-0.5 break-words w-full line-clamp-2 ${selectedDay === day ? 'text-[var(--primary)]' : 'text-white/20'
                                }`}>
                                {wName}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Current Workout Header */}
            <div className="group relative overflow-hidden glass-panel p-6 border-l-4 border-l-[var(--primary)] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Dumbbell size={80} />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                                {selectedDay} • {!currentWorkout ? 'Recuperação' : 'Ficha Ativa'}
                            </span>
                            <h2 className="text-2xl font-black text-white mt-3 uppercase tracking-tight leading-tight">
                                {!currentWorkout ? 'Dia de Descanso' : currentWorkout.name}
                            </h2>
                        </div>
                        {currentWorkout && workoutPlan?.workouts && (
                            <button onClick={() => startEditing(currentWorkoutType)} className="p-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-black rounded-xl transition-all border border-[var(--primary)]/20 shadow-lg">
                                <Edit2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
                {!currentWorkout ? (
                    <div className="py-16 text-center glass-panel border-dashed border-white/10 bg-white/5">
                        <Calendar size={48} className="mx-auto mb-4 text-white/5" />
                        <h3 className="text-lg font-black text-white/30 uppercase tracking-widest mb-2">Foco na Recuperação</h3>
                        <p className="text-xs text-[var(--text-muted)] italic px-8 leading-relaxed">
                            "O ferro nunca mente, mas o corpo às vezes grita." Aproveite para recarregar as energias.
                        </p>
                    </div>
                ) : (
                    currentWorkout.exercises.map((ex, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleToggle(idx)}
                            className={`group flex items-center gap-4 glass-panel p-4 cursor-pointer transition-all border-l-4 ${isCompleted(idx)
                                ? 'bg-[var(--primary)]/5 border-l-[var(--primary)] opacity-70'
                                : 'hover:bg-white/[0.05] border-l-transparent'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all bg-black/20 ${isCompleted(idx)
                                ? 'text-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]'
                                : 'text-white/10 group-hover:text-white/40'
                                }`}>
                                {isCompleted(idx) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-black text-sm uppercase tracking-wide transition-all ${isCompleted(idx) ? 'text-white/40 line-through' : 'text-white'
                                    }`}>
                                    {ex.name}
                                </h4>
                                <div className="flex gap-4 mt-1.5">
                                    <div className="bg-black/40 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1.5">
                                        <span className="text-[9px] uppercase font-black text-[var(--text-muted)]">Sets</span>
                                        <span className="text-[10px] font-black text-[var(--primary)]">{ex.sets}</span>
                                    </div>
                                    <div className="bg-black/40 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1.5">
                                        <span className="text-[9px] uppercase font-black text-[var(--text-muted)]">Reps</span>
                                        <span className="text-[10px] font-black text-[var(--primary)]">{ex.reps}</span>
                                    </div>
                                </div>
                            </div>

                            <ChevronRight size={16} className={`text-white/10 transition-transform ${isCompleted(idx) ? 'hidden' : 'group-hover:translate-x-1'}`} />
                        </div>
                    ))
                )}
            </div>

            {/* Floating Summary Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md mx-auto z-40 bg-black/80 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl flex items-center justify-between shadow-2xl">
                <button
                    onClick={() => setShowFreqSelector(true)}
                    className="flex-1 flex flex-col items-center py-2 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                >
                    <RefreshCw size={20} />
                    <span className="text-[8px] uppercase font-black mt-1">Resetar Tudo</span>
                </button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <div className="flex-[2] flex flex-col items-center">
                    <span className="text-[8px] uppercase font-black text-[var(--text-muted)] mb-1.5">
                        Progresso de Hoje: {workoutPlan?.completedData?.[todayStr]?.[currentWorkoutType]?.length || 0} / {currentWorkout?.exercises?.length || 0}
                    </span>
                    <div className="w-full flex gap-1 justify-center">
                        {currentWorkoutType && currentWorkoutType !== 'Descanso' ? (
                            Array.from({ length: currentWorkout.exercises.length }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-all ${isCompleted(i) ? 'bg-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]' : 'bg-white/10'
                                        }`}
                                />
                            ))
                        ) : (
                            <span className="text-[9px] text-[var(--primary)] font-black tracking-widest animate-pulse">MODO RECUPERAÇÃO</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
