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

    // Load Data from Supabase
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                // 1. Load Game Profile
                let { data: gameProfile } = await supabase.from('user_game_profiles').select('*').eq('user_id', user.id).single();
                
                if (!gameProfile) {
                    const { data: newProfile } = await supabase.from('user_game_profiles').insert({
                        user_id: user.id,
                        level: 1,
                        current_xp: 0,
                        username: user.user_metadata?.name || '',
                        avatar_url: user.user_metadata?.avatarUrl || ''
                    }).select().single();
                    gameProfile = newProfile;
                }

                if (gameProfile) {
                    setGameStats({
                        points: gameProfile.current_xp || 0,
                        rankIndex: (gameProfile.level || 1) - 1
                    });
                    if (gameProfile.history) setHistory(gameProfile.history);
                    if (gameProfile.username) setUserName(gameProfile.username);
                    if (gameProfile.avatar_url) setUserPhoto(gameProfile.avatar_url);
                }

                // 2. Load Health Profile (for bio stats)
                const { data: healthProfile } = await supabase.from('health_profiles').select('age, height, sex').eq('user_id', user.id).single();
                
                if (healthProfile) {
                    if (healthProfile.age) setUserAge(healthProfile.age.toString());
                    if (healthProfile.height) setUserHeight(healthProfile.height.toString());
                    if (healthProfile.sex) setUserSex(healthProfile.sex);
                }

            } catch (error) {
                console.error("Error loading game data:", error);
            } finally {
                setMounted(true);
            }
        };

        loadData();
    }, [user]);

    // Sync Game Stats & History to Supabase
    useEffect(() => {
        if (mounted && user) {
            const timer = setTimeout(async () => {
                await supabase.from('user_game_profiles').upsert({
                    user_id: user.id,
                    level: gameStats.rankIndex + 1,
                    current_xp: gameStats.points,
                    history: history,
                    updated_at: new Date()
                });
            }, 2000); // 2s debounce
            return () => clearTimeout(timer);
        }
    }, [gameStats, history, user, mounted]);

    // Sync Profile Info to Supabase
    useEffect(() => {
        if (mounted && user) {
            const timer = setTimeout(async () => {
                // Update Game Profile
                await supabase.from('user_game_profiles').upsert({
                    user_id: user.id,
                    username: userName,
                    avatar_url: userPhoto,
                    updated_at: new Date()
                });

                // Update Health Profile
                await supabase.from('health_profiles').upsert({
                    user_id: user.id,
                    age: parseInt(userAge) || null,
                    height: parseFloat(userHeight) || null,
                    sex: userSex,
                    updated_at: new Date()
                });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [userName, userPhoto, userAge, userHeight, userSex, user, mounted]);

    const { points, rankIndex } = gameStats;
    const currentRank = RANKS[rankIndex] || RANKS[0];
    const nextRank = rankIndex < RANKS.length - 1 ? RANKS[rankIndex + 1] : null;

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
