'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const GameContext = createContext();

export const RANKS = [
    { name: 'Bronze', color: '#cd7f32' },
    { name: 'Prata', color: '#c0c0c0' },
    { name: 'Ouro', color: '#ffd700' },
    { name: 'Platina', color: '#e5e4e2' },
    { name: 'Diamante', color: '#b9f2ff' },
    { name: 'Mestre', color: '#ff69b4' },
    { name: 'Desafiante', color: '#ff4500' }
];

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [gameStats, setGameStats] = useState({ points: 0, rankIndex: 0 });
    const [history, setHistory] = useState([]);
    const [userName, setUserName] = useState('Lucas');
    const [userPhoto, setUserPhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas');
    const [userAge, setUserAge] = useState('');
    const [userHeight, setUserHeight] = useState('');
    const [userSex, setUserSex] = useState('male');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedStats = localStorage.getItem('gamification_stats');
        const savedHistory = localStorage.getItem('gamification_history');
        const savedName = localStorage.getItem('gamification_user_name');
        const savedPhoto = localStorage.getItem('gamification_user_photo');
        const savedAge = localStorage.getItem('gamification_user_age');
        const savedHeight = localStorage.getItem('gamification_user_height');
        const savedSex = localStorage.getItem('gamification_user_sex');

        if (savedStats) setGameStats(JSON.parse(savedStats));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        if (savedName) setUserName(savedName);
        if (savedPhoto) setUserPhoto(savedPhoto);
        if (savedAge) setUserAge(savedAge);
        if (savedHeight) setUserHeight(savedHeight);
        if (savedSex) setUserSex(savedSex);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('gamification_stats', JSON.stringify(gameStats));
        }
    }, [gameStats, mounted]);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('gamification_history', JSON.stringify(history));
            localStorage.setItem('gamification_user_name', userName);
            localStorage.setItem('gamification_user_photo', userPhoto);
            localStorage.setItem('gamification_user_age', userAge);
            localStorage.setItem('gamification_user_height', userHeight);
            localStorage.setItem('gamification_user_sex', userSex);
        }
    }, [history, userName, userPhoto, userAge, userHeight, userSex, mounted]);

    const { points, rankIndex } = gameStats;
    const currentRank = RANKS[rankIndex] || RANKS[0];
    const nextRank = rankIndex < RANKS.length - 1 ? RANKS[rankIndex + 1] : null;

    // Each rank is always 100 points
    const pointsToNext = 100 - points;
    const progressToNext = points;

    const addPoints = useCallback((amount, reason) => {
        setGameStats(prev => {
            let newPoints = prev.points + amount;
            let newRank = prev.rankIndex;

            if (newPoints >= 100) {
                if (newRank < RANKS.length - 1) {
                    newRank += 1;
                    newPoints -= 100;
                } else {
                    newPoints = 100; // Cap
                }
            }
            return { points: newPoints, rankIndex: newRank };
        });
        setHistory(prev => [{ date: new Date().toISOString(), amount, reason, type: 'gain' }, ...prev]);
    }, []);

    const removePoints = useCallback((amount, reason) => {
        setGameStats(prev => {
            let newPoints = prev.points - amount;
            let newRank = prev.rankIndex;

            if (newPoints < 0) {
                if (newRank > 0) {
                    newRank -= 1;
                    newPoints = 100 + newPoints;
                } else {
                    newPoints = 0; // Floor
                }
            }
            return { points: newPoints, rankIndex: newRank };
        });
        setHistory(prev => [{ date: new Date().toISOString(), amount, reason, type: 'loss' }, ...prev]);
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <GameContext.Provider value={{
            points,
            currentRank,
            nextRank,
            pointsToNext,
            progressToNext,
            addPoints,
            removePoints,
            userName,
            setUserName,
            userPhoto,
            setUserPhoto,
            userAge,
            setUserAge,
            userHeight,
            setUserHeight,
            userSex,
            setUserSex,
            history,
            formatCurrency,
            rankIndex
        }}>
            {children}
        </GameContext.Provider>
    );
};
