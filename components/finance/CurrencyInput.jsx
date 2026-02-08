'use client';

import React from 'react';

export const CurrencyInput = ({ value, onChange, placeholder, className }) => {
    // Helper to format raw cents/number into R$ string
    const formatBRL = (val) => {
        const number = parseFloat(val) || 0;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(number);
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
        const numericValue = parseFloat(rawValue) / 100; // Convert to decimal (cents logic)
        onChange(numericValue);
    };

    // When displaying, we show the formatted string
    // When the user clicks/focuses, we want to handle the input naturally

    const displayValue = value === '' || value === undefined ? '' : formatBRL(value);

    return (
        <input
            type="text"
            className={className}
            placeholder={placeholder || 'R$ 0,00'}
            value={displayValue}
            onChange={handleChange}
        />
    );
};
