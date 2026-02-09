'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

const RoutineContext = createContext();

const STORAGE_KEY = 'lifeos_routine';
const PROCESSED_KEY = 'lifeos_routine_processed';
const RESET_KEY = 'lifeos_routine_reset';

export const RoutineProvider = ({ children }) => {
    const { addPoints, removePoints } = useGame();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [mounted, setMounted] = useState(false);

    // Load tasks
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        let localTasks = saved ? JSON.parse(saved) : [];

        // Prefer remote routine if available
        if (user?.user_metadata?.routine && Array.isArray(user.user_metadata.routine)) {
            setTasks(user.user_metadata.routine);
        } else {
            setTasks(localTasks);
        }
        setMounted(true);
    }, [user]);

    const getTodaysTasks = () => {
        if (!tasks) return [];
        const today = new Date().getDay(); // 0 = Sunday
        return tasks.filter(task => task.days && task.days.includes(today)).sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    // Add task
    const addTask = (task) => {
        const newTasks = [...tasks, { ...task, id: Date.now(), completed: false, order: tasks.length }];
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        if (user) supabase.auth.updateUser({ data: { routine: newTasks } });
    };

    // Toggle task
    const toggleTask = (id) => {
        const newTasks = tasks.map(t => {
            if (t.id === id) {
                const isCompleted = !t.completed;
                if (isCompleted) {
                    addPoints(5, `Tarefa concluída: ${t.title}`);
                } else {
                    removePoints(5, `Tarefa desmarcada: ${t.title}`);
                }
                return { ...t, completed: isCompleted };
            }
            return t;
        });
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        if (user) supabase.auth.updateUser({ data: { routine: newTasks } });
    };

    // Delete task
    const deleteTask = (id) => {
        const newTasks = tasks.filter(t => t.id !== id);
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        if (user) supabase.auth.updateUser({ data: { routine: newTasks } });
    };

    // Update task time
    const updateTaskTime = (id, newTime) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, time: newTime } : t);
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        if (user) supabase.auth.updateUser({ data: { routine: newTasks } });
    };

    // Check alarms
    const checkAlarms = () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const currentDay = now.getDay();

        tasks.forEach(task => {
            if (task.days && task.days.includes(currentDay) && task.time === currentTime && !task.completed) {
                new Notification('Shiro - Hora da Rotina!', {
                    body: `Hora de: ${task.title}`,
                    icon: '/icon.png'
                });
            }
        });
    };

    // Daily evaluation and reset logic
    useEffect(() => {
        if (!mounted) return;

        const checkRoutine = () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const lastProcessed = localStorage.getItem(PROCESSED_KEY);
            const lastReset = localStorage.getItem(RESET_KEY);

            const todaysTasks = getTodaysTasks();

            // 1. LATE EVALUATION (If we opened the app today but yesterday wasn't processed)
            if (lastReset === yesterdayStr && lastProcessed !== yesterdayStr) {
                if (todaysTasks.length > 0) {
                    const completedCount = todaysTasks.filter(t => t.completed).length;
                    const completionRate = completedCount / todaysTasks.length;

                    if (completionRate === 1) {
                        addPoints(20, `Rotina Perfeita (Ontem): 100% concluída`);
                    } else if (completionRate >= 0.8) {
                        addPoints(18, `Ótima Rotina (Ontem): ${Math.round(completionRate * 100)}% concluída`);
                    } else {
                        removePoints(20, `Rotina Incompleta (Ontem): apenas ${Math.round(completionRate * 100)}% concluída`);
                    }
                }
                localStorage.setItem(PROCESSED_KEY, yesterdayStr);
            }

            // 2. DAILY RESET (If it's a new day, clear completions)
            if (lastReset !== todayStr) {
                setTasks(prev => prev.map(t => ({ ...t, completed: false })));
                localStorage.setItem(RESET_KEY, todayStr);
            }

            // 3. END OF DAY EVALUATION (at 23:50)
            const isEvaluationTime = now.getHours() === 23 && now.getMinutes() >= 50;
            if (isEvaluationTime && lastProcessed !== todayStr) {
                if (todaysTasks.length > 0) {
                    const completedCount = todaysTasks.filter(t => t.completed).length;
                    const completionRate = completedCount / todaysTasks.length;

                    if (completionRate === 1) {
                        addPoints(20, `Rotina Perfeita: 100% concluída`);
                    } else if (completionRate >= 0.8) {
                        addPoints(18, `Ótima Rotina: ${Math.round(completionRate * 100)}% concluída`);
                    } else {
                        removePoints(20, `Rotina Incompleta: apenas ${Math.round(completionRate * 100)}% concluída`);
                    }
                }
                localStorage.setItem(PROCESSED_KEY, todayStr);
            }
        };

        checkRoutine();
        const interval = setInterval(checkRoutine, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [mounted, tasks, addPoints, removePoints]);

    // Save and sync
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            checkAlarms();
            if (user) {
                supabase.auth.updateUser({ data: { routine: tasks } });
            }
        }
    }, [tasks, mounted, user]);

    return (
        <RoutineContext.Provider value={{
            tasks,
            setTasks,
            addTask,
            toggleTask,
            deleteTask,
            updateTaskTime,
            getTodaysTasks
        }}>
            {children}
        </RoutineContext.Provider>
    );
};

export const useRoutine = () => {
    const context = useContext(RoutineContext);
    if (!context) {
        throw new Error('useRoutine must be used within a RoutineProvider');
    }
    return context;
};
