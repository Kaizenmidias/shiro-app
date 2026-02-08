'use client';

import React, { useState } from 'react';
import { useRoutine } from '../../hooks/useRoutine';
import { Plus, Check, Trash2, Clock, Calendar, Bell, Pencil, ChevronUp, ChevronDown, CheckSquare } from 'lucide-react';

const DAYS = [
    { id: 0, label: 'D' },
    { id: 1, label: 'S' },
    { id: 2, label: 'T' },
    { id: 3, label: 'Q' },
    { id: 4, label: 'Q' },
    { id: 5, label: 'S' },
    { id: 6, label: 'S' },
];

export const RoutineList = () => {
    const { getTodaysTasks, addTask, updateTask, moveTask, toggleTask, removeTask, mounted } = useRoutine();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskData, setTaskData] = useState({
        title: '',
        time: '',
        frequency: 'everyday',
        customDays: []
    });

    if (!mounted) return null;

    // Use tasks directly from hook to maintain manual order, but filter for today
    const todaysTasks = getTodaysTasks();

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setTaskData({
                title: task.title,
                time: task.time || '',
                frequency: task.frequency,
                customDays: task.customDays || []
            });
        } else {
            setEditingTask(null);
            setTaskData({ title: '', time: '', frequency: 'everyday', customDays: [] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskData.title) return;

        if (editingTask) {
            updateTask({ ...editingTask, ...taskData });
        } else {
            addTask(taskData);
        }

        setIsModalOpen(false);
        setEditingTask(null);
    };

    const toggleDay = (dayId) => {
        const current = taskData.customDays;
        const updated = current.includes(dayId)
            ? current.filter(d => d !== dayId)
            : [...current, dayId];
        setTaskData({ ...taskData, customDays: updated });
    };

    return (
        <div className="pb-24 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CheckSquare className="text-[var(--primary)]" />
                        Minha Rotina
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm">{todaysTasks.filter(t => !t.completed).length} tarefas restantes para hoje</p>
                </div>
                <div className="text-right text-xs font-mono text-[var(--primary)]">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="space-y-3">
                {todaysTasks.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-[var(--glass-border)] rounded-2xl opacity-50">
                        <Clock size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">Nada programado para hoje</p>
                    </div>
                ) : (
                    todaysTasks.map((task, index) => (
                        <div key={task.id} className={`glass-panel p-4 flex items-center gap-3 group transition-all ${task.completed ? 'opacity-50' : 'hover:border-[var(--primary)]/50'}`}>

                            {/* Reorder Controls */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => moveTask(task.id, 'up')}
                                    disabled={index === 0}
                                    className="text-[var(--text-muted)] hover:text-[var(--primary)] disabled:opacity-20"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveTask(task.id, 'down')}
                                    disabled={index === todaysTasks.length - 1}
                                    className="text-[var(--text-muted)] hover:text-[var(--primary)] disabled:opacity-20"
                                >
                                    <ChevronDown size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.completed
                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-black'
                                    : 'border-[var(--text-muted)] text-transparent hover:border-[var(--primary)]'
                                    }`}
                            >
                                <Check size={14} strokeWidth={3} />
                            </button>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-medium ${task.completed ? 'line-through text-[var(--text-muted)]' : 'text-white'}`}>{task.title}</h3>
                                {task.time && (
                                    <div className="flex items-center gap-1 text-xs text-[var(--primary)] font-mono mt-1">
                                        <Bell size={10} />
                                        {task.time}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleOpenModal(task)}
                                    className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--primary)] transition-all p-2"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => removeTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={() => handleOpenModal()}
                className="fixed bottom-24 md:bottom-12 right-6 md:right-12 bg-[var(--primary)] text-black p-4 rounded-xl shadow-[0_0_20px_var(--primary-glow)] hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} />
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 md:p-8 border-[var(--primary)] animate-fade-in shadow-[0_0_50px_rgba(0,243,255,0.15)]">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <span className="text-[var(--primary)]">{editingTask ? '/// EDITAR' : '/// NOVA'}</span> TAREFA
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="O que você precisa fazer?"
                                className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--primary)]"
                                value={taskData.title}
                                onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                                autoFocus
                            />

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-[var(--text-muted)] mb-1 block uppercase font-mono">Horário (Opcional)</label>
                                    <input
                                        type="time"
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--primary)] [color-scheme:dark]"
                                        value={taskData.time}
                                        onChange={e => setTaskData({ ...taskData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-[var(--text-muted)] mb-2 block uppercase font-mono">Repetição</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setTaskData({ ...taskData, frequency: 'everyday' })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${taskData.frequency === 'everyday' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--surface-color)] text-[var(--text-muted)] hover:text-white'}`}
                                    >
                                        Todos os dias
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTaskData({ ...taskData, frequency: 'workdays' })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${taskData.frequency === 'workdays' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--surface-color)] text-[var(--text-muted)] hover:text-white'}`}
                                    >
                                        Dias úteis
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTaskData({ ...taskData, frequency: 'custom' })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${taskData.frequency === 'custom' ? 'bg-[var(--primary)] text-black' : 'bg-[var(--surface-color)] text-[var(--text-muted)] hover:text-white'}`}
                                    >
                                        Personalizado
                                    </button>
                                </div>

                                {taskData.frequency === 'custom' && (
                                    <div className="flex justify-between mt-2 p-3 bg-black/20 rounded-lg">
                                        {DAYS.map(day => (
                                            <button
                                                key={day.id}
                                                type="button"
                                                onClick={() => toggleDay(day.id)}
                                                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${taskData.customDays.includes(day.id) ? 'bg-[var(--primary)] text-black shadow-[0_0_10px_var(--primary-glow)]' : 'bg-[var(--surface-color)] text-[var(--text-muted)] hover:text-white'}`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--glass-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-highlight)] transition-colors text-sm font-bold uppercase tracking-wider"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-lg bg-[var(--primary)] text-black font-bold text-sm shadow-[0_0_15px_var(--primary-glow)] hover:shadow-[0_0_25px_var(--primary-glow)] transition-all uppercase tracking-wider"
                                >
                                    {editingTask ? 'Salvar Edição' : 'Criar Tarefa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
