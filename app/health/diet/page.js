'use client';

import React from 'react';
import { useHealth } from '../../../hooks/useHealth';
import { DietTab } from '../../../components/health/DietTab';

export default function DietPage() {
    const healthData = useHealth();
    return <DietTab {...healthData} />;
}
