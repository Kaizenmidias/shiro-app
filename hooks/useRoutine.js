'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'lifeos_routine';
const PROCESSED_KEY = 'lifeos_routine_processed';
const RESET_KEY = 'lifeos_routine_reset';

export const useRoutine = () => {
    const { addPoints, removePoints } = useGame();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [mounted, setMounted] = useState(false);

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
            // We evaluate based on the tasks state currently in memory (which would be from the last time the app was used)
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

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            checkAlarms();
            if (user) {
                supabase.auth.updateUser({ data: { routine: tasks } });
            }
        }
    }, [tasks, mounted, user]);

    // Simple alarm check (polling)
    useEffect(() => {
        if (!mounted || !("Notification" in window)) return;

        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            checkAlarms();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [mounted, tasks]);

    const playAlarm = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);
    };

    const checkAlarms = () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // This is a naive implementation. In a real app, we'd track "lastNotified" to avoid spam.
        // For now, we rely on the minute granularity.
        tasks.forEach(task => {
            if (task.time === currentTime && !task.completed && shouldRunToday(task)) {
                playAlarm();
                if (Notification.permission === "granted") {
                    new Notification(`Hora da tarefa: ${task.title}`, {
                        body: "Mantenha sua rotina em dia!",
                        icon: "/icon.png" // Placeholder
                    });
                }
            }
        });
    };

    const shouldRunToday = (task) => {
        const today = new Date().getDay(); // 0 = Sun, 6 = Sat
        const daysMap = {
            'everyday': [0, 1, 2, 3, 4, 5, 6],
            'workdays': [1, 2, 3, 4, 5],
            'custom': task.customDays || []
        };
        return daysMap[task.frequency]?.includes(today);
    };

    const addTask = (task) => {
        const order = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) + 1 : 0;
        setTasks([...tasks, { ...task, id: Date.now().toString(), completed: false, order }]);
    };

    const updateTask = (updatedTask) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const moveTask = (id, direction) => {
        const visibleTasks = getTodaysTasks();
        const currentIndex = visibleTasks.findIndex(t => t.id === id);
        if (currentIndex === -1) return;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= visibleTasks.length) return;

        const targetTask = visibleTasks[targetIndex];

        // Swap orders in the full list
        const newTasks = [...tasks];
        const idxA = newTasks.findIndex(t => t.id === id);
        const idxB = newTasks.findIndex(t => t.id === targetTask.id);

        if (idxA !== -1 && idxB !== -1) {
            const tempOrder = newTasks[idxA].order;
            newTasks[idxA].order = newTasks[idxB].order;
            newTasks[idxB].order = tempOrder;

            // Sort by order to maintain internal consistency
            newTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
            setTasks(newTasks);
        }
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const getTodaysTasks = () => {
        return tasks
            .filter(task => shouldRunToday(task))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    return {
        tasks,
        getTodaysTasks,
        addTask,
        updateTask,
        moveTask,
        toggleTask,
        removeTask,
        mounted
    };
};
