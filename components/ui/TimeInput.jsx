'use client';

import React from 'react';

export const TimeInput = ({ value, onChange, className, placeholder = "HH:mm" }) => {
    const handleChange = (e) => {
        let input = e.target.value.replace(/[^0-9]/g, '');
        
        if (input.length > 4) input = input.slice(0, 4);

        if (input.length >= 2) {
            const hours = parseInt(input.slice(0, 2));
            if (hours > 23) {
                // Se horas > 23, assumimos o último dígito digitado ou travamos em 23
                // Estratégia simples: cortar para o máximo válido se o usuário digitou rápido
                // Mas melhor é deixar digitar e validar na formatação
                // Vamos apenas impedir o quarto caractere se for inválido?
                // Não, vamos deixar digitar e validar onBlur ou restringir input
            }
        }

        let formatted = input;
        if (input.length > 2) {
            formatted = `${input.slice(0, 2)}:${input.slice(2)}`;
        }

        // Validação estrita de valores ao digitar para evitar "99:99"
        if (input.length >= 2) {
             const h = parseInt(input.slice(0, 2));
             if (h > 23) formatted = '23' + (input.length > 2 ? ':' + input.slice(2) : '');
        }
        if (input.length >= 4) {
             const m = parseInt(input.slice(2, 4));
             if (m > 59) formatted = formatted.slice(0, 3) + '59';
        }

        onChange(formatted);
    };

    const handleBlur = () => {
        // Formatação final ao sair do campo (ex: preencher zeros)
        if (!value) return;
        
        let [h, m] = value.split(':');
        
        if (!m && h && h.length === 2) {
             // Usuário digitou "12" e saiu -> vira "12:00"
             onChange(`${h}:00`);
             return;
        }

        if (h && (h.length === 1)) h = '0' + h;
        if (m && (m.length === 1)) m = '0' + m;
        
        if (h && m) onChange(`${h}:${m}`);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            className={className}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={5}
        />
    );
};
