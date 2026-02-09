'use client';

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Trophy, Star } from 'lucide-react';
import { RankFrame } from './RankFrame';

export const RankHeader = () => {
    const { points, currentRank, nextRank, pointsToNext, progressToNext, userName, userPhoto } = useGame();

    if (!currentRank) return null; // Hydration guard

    return (
        <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8 relative overflow-hidden group">
            {/* Background Pulse */}
            <div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000"
            />

            <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10 w-full">
                <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                    <div className="relative flex-shrink-0">
                        <RankFrame rank={currentRank}>
                            <img
                                src={userPhoto}
                                alt={userName}
                                className="w-full h-full object-cover rounded-full"
                            />
                        </RankFrame>
                        {/* Floating Rank Icon */}
                        <div
                            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-[var(--surface-color)] rounded-lg border border-[var(--glass-border)] flex items-center justify-center shadow-xl z-20"
                            title={currentRank.name}
                        >
                            <Trophy size={14} style={{ color: currentRank.color, filter: `drop-shadow(0 0 3px ${currentRank.color})` }} />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                            Olá, <span className="text-[var(--primary)]">{userName}</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span
                                className="text-sm md:text-base font-bold"
                                style={{ color: currentRank.color, textShadow: `0 0 10px ${currentRank.color}40` }}
                            >
                                {currentRank.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-[var(--text-muted)] font-bold tracking-wide uppercase border-l border-[var(--glass-border)] pl-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                                Ranking Global
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right flex-shrink-0">
                    <div className="text-2xl md:text-3xl font-bold text-white flex items-center justify-end gap-2" style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
                        <Star className="text-[var(--primary)] fill-[var(--primary)] md:w-5 md:h-5" size={16} />
                        {points.toLocaleString()}
                    </div>
                    {nextRank && (
                        <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-bold mt-1">
                            +{pointsToNext} PONTOS PARA {nextRank.name.toUpperCase()}
                        </p>
                    )}
                </div>
            </div>

            <div className="relative h-1.5 bg-[var(--surface-color)] rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_var(--primary)]"
                    style={{
                        width: `${progressToNext}%`,
                        background: `linear-gradient(90deg, ${currentRank.color}, var(--primary))`
                    }}
                ></div>
            </div>
        </div>
    );
};
