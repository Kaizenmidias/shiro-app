'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

export const useGoals = () => {
    const [goals, setGoals] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('gamification_goals');
        if (saved) setGoals(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (mounted) localStorage.setItem('gamification_goals', JSON.stringify(goals));
    }, [goals, mounted]);

    const addGoal = (goal) => {
        setGoals(prev => [...prev, { ...goal, id: Date.now(), completed: false }]);
    };

    const removeGoal = (id) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    const toggleGoal = (id) => {
        setGoals(prev => prev.map(goal => {
            if (goal.id === id) {
                return { ...goal, completed: !goal.completed };
            }
            return goal;
        }));
    };

    return { goals, addGoal, removeGoal, toggleGoal };
};
