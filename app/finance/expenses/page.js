'use client';

import React from 'react';
import { useFinance } from '../../../hooks/useFinance';
import { ExpensesTab } from '../../../components/finance/ExpensesTab';

export default function ExpensesPage() {
    const financeData = useFinance();
    return <ExpensesTab {...financeData} />;
}
