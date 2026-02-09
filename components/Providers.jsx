'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { GameProvider } from '../contexts/GameContext';
import { RoutineProvider } from '../contexts/RoutineContext';

export function Providers({ children }) {
    return (
        <AuthProvider>
            <GameProvider>
                <RoutineProvider>
                    {children}
                </RoutineProvider>
            </GameProvider>
        </AuthProvider>
    );
}
