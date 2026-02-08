'use client';

import React from 'react';

export const RankFrame = ({ rank, children }) => {
    const getFrameStyles = () => {
        switch (rank?.name) {
            case 'Bronze':
                return {
                    borderColor: '#cd7f32',
                    glow: 'rgba(205, 127, 50, 0.4)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(205, 127, 50, 0.2) 50%, transparent 75%)'
                };
            case 'Prata':
                return {
                    borderColor: '#c0c0c0',
                    glow: 'rgba(192, 192, 192, 0.4)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(192, 192, 192, 0.2) 50%, transparent 75%)'
                };
            case 'Ouro':
                return {
                    borderColor: '#ffd700',
                    glow: 'rgba(255, 215, 0, 0.4)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(255, 215, 0, 0.3) 50%, transparent 75%)'
                };
            case 'Platina':
                return {
                    borderColor: '#e5e4e2',
                    glow: 'rgba(229, 228, 226, 0.5)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(229, 228, 226, 0.3) 50%, transparent 75%)'
                };
            case 'Diamante':
                return {
                    borderColor: '#b9f2ff',
                    glow: 'rgba(185, 242, 255, 0.6)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(185, 242, 255, 0.4) 50%, transparent 75%)'
                };
            case 'Mestre':
                return {
                    borderColor: '#ff69b4',
                    glow: 'rgba(255, 105, 180, 0.6)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(255, 105, 180, 0.4) 50%, transparent 75%)'
                };
            case 'Desafiante':
                return {
                    borderColor: '#ff4500',
                    glow: 'rgba(255, 69, 0, 0.7)',
                    shimmer: 'linear-gradient(45deg, transparent 25%, rgba(255, 69, 0, 0.5) 50%, transparent 75%)'
                };
            default:
                return {
                    borderColor: 'var(--glass-border)',
                    glow: 'transparent',
                    shimmer: 'none'
                };
        }
    };

    const styles = getFrameStyles();

    return (
        <div className="relative p-1.5">
            {/* Outer Glow */}
            <div
                className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
                style={{ backgroundColor: styles.glow }}
            />

            {/* The Frame */}
            <div
                className="relative rounded-full p-1 border-4 transition-all duration-700 ease-in-out"
                style={{
                    borderColor: styles.borderColor,
                    boxShadow: `inset 0 0 10px ${styles.glow}, 0 0 20px ${styles.glow}`
                }}
            >
                {/* Shimmer Effect */}
                <div
                    className="absolute inset-0 z-10 animate-shimmer rounded-full"
                    style={{
                        backgroundImage: styles.shimmer,
                        backgroundSize: '200% 100%',
                        mixBlendMode: 'overlay'
                    }}
                />

                {/* Content (Avatar) */}
                <div className="relative z-0 rounded-full overflow-hidden w-14 h-14 md:w-16 md:h-16">
                    {children}
                </div>
            </div>
        </div>
    );
};
