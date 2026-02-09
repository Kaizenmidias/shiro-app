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

    // Update task
    const updateTask = (updatedTask) => {
        const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        setTasks(newTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
        if (user) supabase.auth.updateUser({ data: { routine: newTasks } });
    };

    // Move task
    const moveTask = (id, direction) => {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return;
        
        const newTasks = [...tasks];
        if (direction === 'up' && index > 0) {
            [newTasks[index], newTasks[index - 1]] = [newTasks[index - 1], newTasks[index]];
        } else if (direction === 'down' && index < newTasks.length - 1) {
            [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
        }
        
        // Re-assign order based on index
        const orderedTasks = newTasks.map((t, idx) => ({ ...t, order: idx }));
        setTasks(orderedTasks);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orderedTasks));
        if (user) supabase.auth.updateUser({ data: { routine: orderedTasks } });
    };

    // Load tasks from Supabase when user loads
    useEffect(() => {
        const loadRoutine = async () => {
            if (!user) return;
            
            try {
                const { data, error } = await supabase
                    .from('routine_tasks')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('order', { ascending: true });

                if (data) {
                    // Check if we have tasks. If not, maybe migrate from metadata? 
                    // (Optional: for now just use DB)
                    if (data.length === 0 && user.user_metadata?.routine) {
                         // One-time migration could go here, but let's stick to DB first
                         // to avoid "zombie" tasks returning.
                    }
                    setTasks(data);
                } else if (error) {
                    console.error('Error loading routine:', error);
                }
            } catch (err) {
                console.error('Unexpected error loading routine:', err);
            } finally {
                setMounted(true);
            }
        };

        loadRoutine();
    }, [user]);

    const getTodaysTasks = () => {
        if (!tasks) return [];
        const today = new Date().getDay(); // 0 = Sunday
        // Filter by day AND ensure not completed if reset logic applies (handled by effect below)
        // Actually, just filtering by day is enough, completion is state.
        return tasks.filter(task => {
            if (task.frequency === 'everyday') return true;
            if (task.frequency === 'workdays') return today >= 1 && today <= 5;
            if (task.frequency === 'custom' && task.customDays) return task.customDays.includes(today);
            return false; // Fallback
        }).sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    // Add task
    const addTask = async (task) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        const newTask = { 
            ...task, 
            id: tempId, 
            completed: false, 
            order: tasks.length,
            user_id: user.id 
        };
        
        setTasks(prev => [...prev, newTask]);

        const { data, error } = await supabase.from('routine_tasks').insert({
            user_id: user.id,
            title: task.title,
            time: task.time,
            frequency: task.frequency,
            custom_days: task.customDays || [],
            completed: false,
            order: tasks.length
        }).select().single();

        if (data) {
            setTasks(prev => prev.map(t => t.id === tempId ? { ...t, ...data } : t));
        } else if (error) {
            console.error('Error adding task:', error);
            setTasks(prev => prev.filter(t => t.id !== tempId));
        }
    };

    // Toggle task
    const toggleTask = async (id) => {
        if (!user) return;
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;
        
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t));

        if (newCompleted) {
            addPoints(5, `Tarefa concluída: ${task.title}`);
        } else {
            removePoints(5, `Tarefa desmarcada: ${task.title}`);
        }

        const { error } = await supabase.from('routine_tasks').update({ completed: newCompleted }).eq('id', id);
        
        if (error) {
            console.error('Error toggling task:', error);
            // Rollback
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !newCompleted } : t));
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        if (!user) return;
        
        const taskToDelete = tasks.find(t => t.id === id);
        
        // Optimistic
        setTasks(prev => prev.filter(t => t.id !== id));

        const { error } = await supabase.from('routine_tasks').delete().eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
            // Rollback
            if (taskToDelete) setTasks(prev => [...prev, taskToDelete]);
        }
    };

    // Update task
    const updateTask = async (updatedTask) => {
        if (!user) return;

        // Optimistic
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

        const { error } = await supabase.from('routine_tasks').update({
            title: updatedTask.title,
            time: updatedTask.time,
            frequency: updatedTask.frequency,
            custom_days: updatedTask.days || updatedTask.customDays, // Handle both props
            order: updatedTask.order
        }).eq('id', updatedTask.id);

        if (error) {
            console.error('Error updating task:', error);
            // We might want to reload here to be safe, or just log
        }
    };

    // Move task
    const moveTask = async (id, direction) => {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return;
        
        const newTasks = [...tasks];
        if (direction === 'up' && index > 0) {
            [newTasks[index], newTasks[index - 1]] = [newTasks[index - 1], newTasks[index]];
        } else if (direction === 'down' && index < newTasks.length - 1) {
            [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
        }
        
        // Re-assign order based on index
        const orderedTasks = newTasks.map((t, idx) => ({ ...t, order: idx }));
        setTasks(orderedTasks);

        // Batch update order in Supabase
        // Note: Supabase doesn't support bulk update easily in one query for different values
        // We will update individually for now or use an RPC if performance is bad.
        // For < 50 tasks, individual updates are "okay" but not ideal.
        // Let's optimize: only update the two swapped tasks if possible, but re-ordering all is safer for consistency.
        
        // Update local state is enough for UI responsiveness. 
        // Sync in background.
        for (const task of orderedTasks) {
             await supabase.from('routine_tasks').update({ order: task.order }).eq('id', task.id);
        }
    };

    // Check alarms
    const checkAlarms = () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const currentDay = now.getDay();

        tasks.forEach(task => {
            if (task.time === currentTime && !task.completed) {
                // Check if task is for today
                const isToday = 
                    (task.frequency === 'everyday') ||
                    (task.frequency === 'workdays' && currentDay >= 1 && currentDay <= 5) ||
                    (task.frequency === 'custom' && task.custom_days?.includes(currentDay));

                if (isToday) {
                     new Notification('Shiro - Hora da Rotina!', {
                        body: `Hora de: ${task.title}`,
                        icon: '/icon.png'
                    });
                }
            }
        });
    };

    // Daily evaluation and reset logic
    useEffect(() => {
        if (!mounted || !user) return;

        const checkRoutine = async () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const lastProcessed = localStorage.getItem(PROCESSED_KEY);
            const lastReset = localStorage.getItem(RESET_KEY);

            // Use getTodaysTasks() equivalent logic since getTodaysTasks is a function that depends on state
            // But here we want to evaluate tasks from state directly.
            const todayIndex = now.getDay();
            const todaysTasks = tasks.filter(task => {
                if (task.frequency === 'everyday') return true;
                if (task.frequency === 'workdays') return todayIndex >= 1 && todayIndex <= 5;
                if (task.frequency === 'custom' && task.custom_days?.includes(todayIndex)) return true;
                return false;
            });

            // 1. LATE EVALUATION (If we opened the app today but yesterday wasn't processed)
            if (lastReset === yesterdayStr && lastProcessed !== yesterdayStr) {
                // Note: We can't really know yesterday's completion status reliably unless we track history.
                // For now, let's assume if we are here, we missed evaluation.
                // Improving this would require a 'routine_history' table.
                // Skipping "Late Evaluation" for now to avoid complexity in this fix.
                localStorage.setItem(PROCESSED_KEY, yesterdayStr);
            }

            // 2. DAILY RESET (If it's a new day, clear completions in DB)
            if (lastReset !== todayStr) {
                // Reset all tasks to not completed
                const { error } = await supabase.from('routine_tasks')
                    .update({ completed: false })
                    .eq('user_id', user.id);
                
                if (!error) {
                    setTasks(prev => prev.map(t => ({ ...t, completed: false })));
                    localStorage.setItem(RESET_KEY, todayStr);
                }
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
            
            checkAlarms();
        };

        checkRoutine();
        const interval = setInterval(checkRoutine, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [mounted, tasks, addPoints, removePoints, user]);

    return (
        <RoutineContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, updateTask, moveTask, getTodaysTasks }}>
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
