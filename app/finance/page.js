'use client';
import React from 'react';
import { useFinance } from '../../hooks/useFinance';
import { FinanceDashboard } from '../../components/finance/FinanceDashboard';

export default function FinanceIndex() {
    const financeData = useFinance();
    return <FinanceDashboard {...financeData} />;
}
