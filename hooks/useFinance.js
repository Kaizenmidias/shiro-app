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

    useEffect(() => {
        setMounted(true);
        const savedExpenses = localStorage.getItem('gamification_finance_expenses');
        const savedShopping = localStorage.getItem('gamification_finance_shopping');
        const savedCards = localStorage.getItem('gamification_finance_cards');
        const savedReserve = localStorage.getItem('gamification_finance_reserve');
        const savedIncome = localStorage.getItem('gamification_finance_income');
        const savedLastReset = localStorage.getItem('gamification_finance_last_reset');

        let currentExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];
        let currentShopping = savedShopping ? JSON.parse(savedShopping) : [];
        const currentMonth = new Date().getMonth();
        const lastReset = savedLastReset ? parseInt(savedLastReset) : -1;

        // Monthly Reset Logic on Day 1 (or if month changed and not reset yet)
        if (lastReset !== currentMonth) {
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
        setShoppingList(prev => [...prev, { ...item, id, bought: true, value }]);
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
        income, setIncome,
        expenses, addExpense, toggleExpensePaid, removeExpense,
        shoppingList, addItemToShop, toggleShopItem, removeShopItem,
        cards, addCardPurchase, removeCardPurchase, payInstallment,
        reserve, updateReserve, setReserveGoal
    };
};
