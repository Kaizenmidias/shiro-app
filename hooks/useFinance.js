'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

export const useFinance = () => {
    const { formatCurrency } = useGame();
    const [mounted, setMounted] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [cards, setCards] = useState([]);
    const [reserve, setReserve] = useState({ current: 0, goal: 10000, deadline: 12 });
    const [income, setIncome] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        setMounted(true);
        const savedExpenses = localStorage.getItem('gamification_finance_expenses');
        const savedShopping = localStorage.getItem('gamification_finance_shopping');
        const savedCards = localStorage.getItem('gamification_finance_cards');
        const savedReserve = localStorage.getItem('gamification_finance_reserve');
        const savedIncome = localStorage.getItem('gamification_finance_income');
        const savedLastReset = localStorage.getItem('gamification_finance_last_reset');
        const savedHistory = localStorage.getItem('gamification_finance_history');

        let currentExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];
        let currentShopping = savedShopping ? JSON.parse(savedShopping) : [];
        let currentHistory = savedHistory ? JSON.parse(savedHistory) : [];
        const currentMonth = new Date().getMonth();
        const lastReset = savedLastReset ? parseInt(savedLastReset) : -1;

        // Monthly Reset Logic on Day 1 (or if month changed and not reset yet)
        if (lastReset !== currentMonth) {
            // Archive last month's data to history
            const now = new Date();
            // Set date to the last day of the previous month (approximate for logging)
            const logDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

            const newHistoryEntries = [];

            // 1. Paid Fixed Expenses
            currentExpenses.forEach(exp => {
                if (exp.paid) {
                    newHistoryEntries.push({
                        id: `hist_exp_${Date.now()}_${Math.random()}`,
                        type: 'expense',
                        category: 'Fixo',
                        title: exp.title,
                        value: parseFloat(exp.value),
                        date: logDate
                    });
                }
            });

            // 2. Shopping Items (All items in list are considered bought in that month)
            currentShopping.forEach(item => {
                newHistoryEntries.push({
                    id: `hist_shop_${Date.now()}_${Math.random()}`,
                    type: 'expense',
                    category: 'Compras',
                    title: item.title,
                    value: parseFloat(item.value),
                    date: item.date || logDate
                });
            });

            // 3. Income
            if (savedIncome) {
                newHistoryEntries.push({
                    id: `hist_inc_${Date.now()}_${Math.random()}`,
                    type: 'income',
                    category: 'Salário/Receita',
                    title: 'Receita Mensal',
                    value: parseFloat(savedIncome),
                    date: logDate
                });
            }

            currentHistory = [...currentHistory, ...newHistoryEntries];
            localStorage.setItem('gamification_finance_history', JSON.stringify(currentHistory));

            // Uncheck fixed expenses
            currentExpenses = currentExpenses.map(exp => ({ ...exp, paid: false }));

            // Clear shopping list
            currentShopping = [];

            // Reset monthly card payment status
            const savedCards = localStorage.getItem('gamification_finance_cards');
            if (savedCards) {
                const parsedCards = JSON.parse(savedCards);
                const resetCards = parsedCards.map(card => ({ ...card, paidThisMonth: false }));
                setCards(resetCards);
                localStorage.setItem('gamification_finance_cards', JSON.stringify(resetCards));
            }

            localStorage.setItem('gamification_finance_expenses', JSON.stringify(currentExpenses));
            localStorage.setItem('gamification_finance_shopping', JSON.stringify(currentShopping));
            localStorage.setItem('gamification_finance_last_reset', currentMonth.toString());
        }

        setExpenses(currentExpenses);
        setShoppingList(currentShopping);
        setHistory(currentHistory);
        const savedCardsInit = localStorage.getItem('gamification_finance_cards');
        if (savedCardsInit) setCards(JSON.parse(savedCardsInit));
        if (savedReserve) setReserve(JSON.parse(savedReserve));
        if (savedIncome) setIncome(parseFloat(savedIncome));
    }, []);

    useEffect(() => { if (mounted) localStorage.setItem('gamification_finance_expenses', JSON.stringify(expenses)); }, [expenses, mounted]);
    useEffect(() => { if (mounted) localStorage.setItem('gamification_finance_shopping', JSON.stringify(shoppingList)); }, [shoppingList, mounted]);
    useEffect(() => { if (mounted) localStorage.setItem('gamification_finance_cards', JSON.stringify(cards)); }, [cards, mounted]);
    useEffect(() => { if (mounted) localStorage.setItem('gamification_finance_reserve', JSON.stringify(reserve)); }, [reserve, mounted]);
    useEffect(() => { if (mounted) localStorage.setItem('gamification_finance_income', income.toString()); }, [income, mounted]);
    useEffect(() => { if (mounted) localStorage.setItem('gamification_finance_history', JSON.stringify(history)); }, [history, mounted]);

    const addExpense = (expense) => setExpenses(prev => [...prev, { ...expense, id: Date.now(), paid: false }]);
    const toggleExpensePaid = (id) => {
        const exp = expenses.find(e => e.id === id);
        if (!exp || exp.isShopping) return;

        const isPaying = !exp.paid;
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: isPaying } : e));
    };
    const removeExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

    const addItemToShop = (item) => {
        const id = Date.now();
        const value = parseFloat(item.value) || 0;
        setShoppingList(prev => [...prev, { ...item, id, bought: true, value, date: new Date().toISOString() }]);
    };
    const toggleShopItem = (id) => { }; // No longer used
    const removeShopItem = (id) => {
        setShoppingList(prev => prev.filter(i => i.id !== id));
    };

    const addCardPurchase = (purchase) => setCards(prev => [...prev, { ...purchase, id: Date.now(), paidInstallments: 0, paidThisMonth: false }]);
    const removeCardPurchase = (id) => setCards(prev => prev.filter(c => c.id !== id));
    const payInstallment = (id) => {
        const card = cards.find(c => c.id === id);
        if (!card || card.paidInstallments >= card.installments) return;

        const nextInstallment = card.paidInstallments + 1;
        setCards(prev => prev.map(c => c.id === id ? { ...c, paidInstallments: nextInstallment, paidThisMonth: true } : c));
    };

    const updateReserve = (newAmount) => {
        setReserve(prev => ({ ...prev, current: newAmount }));
    };
    const setReserveGoal = (goal, deadline) => setReserve(prev => ({ ...prev, goal, deadline }));

    return {
        income, setIncome, history,
        expenses, addExpense, toggleExpensePaid, removeExpense,
        shoppingList, addItemToShop, toggleShopItem, removeShopItem,
        cards, addCardPurchase, removeCardPurchase, payInstallment,
        reserve, updateReserve, setReserveGoal
    };
};
