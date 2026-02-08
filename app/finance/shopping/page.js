'use client';

import React from 'react';
import { useFinance } from '../../../hooks/useFinance';
import { ShoppingTab } from '../../../components/finance/ShoppingTab';

export default function ShoppingPage() {
    const financeData = useFinance();
    return <ShoppingTab {...financeData} />;
}
