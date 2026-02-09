'use client';

import { useRoutine as useRoutineContext } from '../contexts/RoutineContext';

export const useRoutine = () => {
    return useRoutineContext();
};
