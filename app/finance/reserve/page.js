'use client';

import React from 'react';
import { useFinance } from '../../../hooks/useFinance';
import { ReserveTab } from '../../../components/finance/ReserveTab';

export default function ReservePage() {
    const financeData = useFinance();
    return <ReserveTab {...financeData} />;
}
