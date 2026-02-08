'use client';

import React from 'react';
import { useHealth } from '../../../hooks/useHealth';
import { BodyTab } from '../../../components/health/BodyTab';

export default function BodyPage() {
    const healthData = useHealth();
    return <BodyTab {...healthData} />;
}
