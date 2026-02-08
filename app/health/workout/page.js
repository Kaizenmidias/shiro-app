'use client';

import React from 'react';
import { useHealth } from '../../../hooks/useHealth';
import { WorkoutTab } from '../../../components/health/WorkoutTab';

export default function WorkoutPage() {
    const healthData = useHealth();
    return <WorkoutTab {...healthData} />;
}
