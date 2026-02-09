'use client';

import React, { useState, useEffect } from 'react';

export const DateInput = ({ value, onChange, className, placeholder = "DD/MM/AAAA" }) => {
    // Value arrives as YYYY-MM-DD
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-');
            if (y && m && d) {
                setDisplayValue(`${d}/${m}/${y}`);
            } else {
                setDisplayValue(value);
            }
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        let input = e.target.value.replace(/[^0-9]/g, '');
        
        // Masking logic DD/MM/AAAA
        if (input.length > 8) input = input.slice(0, 8);

        let formatted = input;
        if (input.length > 2) {
            formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
        }
        if (input.length > 4) {
            formatted = `${formatted.slice(0, 5)}/${input.slice(4)}`;
        }

        setDisplayValue(formatted);

        // Convert back to YYYY-MM-DD if complete
        if (input.length === 8) {
            const day = input.slice(0, 2);
            const month = input.slice(2, 4);
            const year = input.slice(4, 8);
            
            // Basic validation
            const d = parseInt(day);
            const m = parseInt(month);
            const y = parseInt(year);

            if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100) {
                onChange(`${year}-${month}-${day}`);
            }
        }
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            className={className}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            maxLength={10}
        />
    );
};
