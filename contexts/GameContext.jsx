'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

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
    const { user } = useAuth();
    const [gameStats, setGameStats] = useState({ points: 0, rankIndex: 0 });
    const [history, setHistory] = useState([]);
    const [userName, setUserName] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [userAge, setUserAge] = useState('');
    const [userHeight, setUserHeight] = useState('');
    const [userSex, setUserSex] = useState('male');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (user?.user_metadata) {
            const { name, age, height, sex, avatarUrl, gameStats: remoteStats, history: remoteHistory } = user.user_metadata;
            
            // Sync Game Stats from Cloud
            if (remoteStats) {
                setGameStats(current => {
                     // Avoid reset if local has more progress (optional conflict resolution?)
                     // For now, cloud is truth source for multi-device
                     if (JSON.stringify(current) !== JSON.stringify(remoteStats)) {
                         console.log('GameContext: Syncing stats from Supabase', remoteStats);
                         return remoteStats;
                     }
                     return current;
                });
            }

            // Sync History from Cloud
            if (remoteHistory) {
                setHistory(current => {
                    if (JSON.stringify(current) !== JSON.stringify(remoteHistory)) {
                         console.log('GameContext: Syncing history from Supabase');
                         return remoteHistory;
                    }
                    return current;
                });
            }

            if (name) {
                setUserName(name);
                setUserPhoto(current => {
                    console.log('GameContext: Resolving avatar...', { metadataUrl: avatarUrl, currentUrl: current });
                    
                    // 1. Prioritize Valid Supabase URL from Metadata
                    if (avatarUrl && !avatarUrl.startsWith('blob:') && avatarUrl.includes('supabase')) {
                         console.log('GameContext: Using metadata avatar (Supabase)');
                         return avatarUrl;
                    }

                    // 2. Fallback to Valid Local State (if metadata is missing/old but we have a good local one)
                    // If current is a Supabase URL and metadata is missing or DiceBear, stick with current
                    if (current && current.includes('supabase') && !current.startsWith('blob:')) {
                         console.log('GameContext: Keeping current local avatar (Supabase) over metadata');
                         return current;
                    }

                    // 3. Use other valid metadata URL (external, etc)
                    if (avatarUrl && !avatarUrl.startsWith('blob:')) {
                        return avatarUrl;
                    }

                    // 4. Default DiceBear
                    if (current && !current.includes('dicebear') && !current.startsWith('blob:')) return current;
                    
                    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                });
            }
            if (age) setUserAge(age);
            if (height) setUserHeight(height);
            if (sex) setUserSex(sex);
        }
    }, [user]);

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
        if (savedPhoto) {
            if (savedPhoto.startsWith('blob:')) {
                // If it's a blob URL, it's likely invalid/expired. Don't use it.
                // We should rely on what's in Supabase or the default.
                localStorage.removeItem('gamification_user_photo');
            } else {
                setUserPhoto(savedPhoto);
            }
        }
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

    // Sync Game Stats & History to Supabase
    useEffect(() => {
        if (mounted && user) {
            const timer = setTimeout(() => {
                // Check if data is different from metadata before sending request to avoid loops/waste
                const meta = user.user_metadata || {};
                const statsChanged = JSON.stringify(gameStats) !== JSON.stringify(meta.gameStats);
                // For history, just check length or first item for optimization
                const historyChanged = JSON.stringify(history) !== JSON.stringify(meta.history);

                if (statsChanged || historyChanged) {
                    supabase.auth.updateUser({
                        data: {
                            gameStats,
                            history: history.slice(0, 50) // Limit to last 50 items to prevent metadata overflow
                        }
                    }).catch(err => console.error('Failed to sync game stats:', err));
                }
            }, 2000); // 2s debounce
            return () => clearTimeout(timer);
        }
    }, [gameStats, history, user, mounted]);

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
