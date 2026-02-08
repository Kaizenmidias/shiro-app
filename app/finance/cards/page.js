'use client';

import React from 'react';
import { useFinance } from '../../../hooks/useFinance';
import { CreditCardTab } from '../../../components/finance/CreditCardTab';

export default function CardsPage() {
    const financeData = useFinance();
    return <CreditCardTab {...financeData} />;
}
