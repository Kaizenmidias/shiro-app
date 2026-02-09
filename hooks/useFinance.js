'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const useFinance = () => {
    const { user } = useAuth();
    const { formatCurrency } = useGame();
    const [mounted, setMounted] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [cards, setCards] = useState([]);
    const [reserve, setReserve] = useState({ current: 0, goal: 10000, deadline: 12 });
    const [income, setIncome] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                // 1. Settings (Income, Reserve, Last Reset)
                let { data: settings } = await supabase.from('finance_settings').select('*').eq('user_id', user.id).single();
                
                if (!settings) {
                    const { data: newSettings } = await supabase.from('finance_settings').insert({
                        user_id: user.id,
                        monthly_income: 0,
                        reserve_current: 0,
                        last_reset_month: -1
                    }).select().single();
                    settings = newSettings;
                }

                if (settings) {
                    setIncome(parseFloat(settings.monthly_income) || 0);
                    setReserve({
                        current: parseFloat(settings.reserve_current) || 0,
                        goal: parseFloat(settings.reserve_goal) || 10000,
                        deadline: settings.reserve_deadline || 12
                    });
                }

                // 2. Transactions (Expenses & Shopping)
                const { data: transactions } = await supabase.from('finance_transactions').select('*').eq('user_id', user.id);
                
                const loadedExpenses = [];
                const loadedShopping = [];

                if (transactions) {
                    transactions.forEach(t => {
                        if (t.is_recurring_fixed) {
                            loadedExpenses.push({
                                id: t.id,
                                title: t.title,
                                value: parseFloat(t.value),
                                paid: t.is_paid,
                                category: t.category
                            });
                        } else if (t.is_shopping_item) {
                            loadedShopping.push({
                                id: t.id,
                                title: t.title,
                                value: parseFloat(t.value),
                                bought: true,
                                date: t.date
                            });
                        }
                    });
                }
                setExpenses(loadedExpenses);
                setShoppingList(loadedShopping);

                // 3. Cards
                const { data: loadedCards } = await supabase.from('finance_cards').select('*').eq('user_id', user.id);
                if (loadedCards) {
                    setCards(loadedCards.map(c => ({
                        id: c.id,
                        title: c.title,
                        value: parseFloat(c.total_value), // Map total_value to value (as used in UI)
                        installments: c.installments,
                        paidInstallments: c.paid_installments,
                        paidThisMonth: c.paid_this_month,
                        createdAt: c.created_at
                    })));
                }

                // 4. History
                const { data: loadedHistory } = await supabase.from('finance_history').select('*').eq('user_id', user.id).order('month_date', { ascending: false });
                if (loadedHistory) {
                    const flatHistory = loadedHistory.flatMap(h => h.month_data);
                    setHistory(flatHistory);
                }

                // Monthly Reset Logic
                const currentMonth = new Date().getMonth();
                const lastReset = settings?.last_reset_month ?? -1;

                if (lastReset !== currentMonth) {
                    await performMonthlyReset(user.id, currentMonth, loadedExpenses, loadedShopping, settings?.monthly_income, loadedCards, loadedHistory || []);
                }

            } catch (error) {
                console.error("Error loading finance data:", error);
            } finally {
                setMounted(true);
            }
        };

        loadData();
    }, [user]);

    const performMonthlyReset = async (userId, currentMonth, currentExpenses, currentShopping, savedIncome, currentCards, existingHistory) => {
        const now = new Date();
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

        // 2. Shopping Items
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

        if (newHistoryEntries.length > 0) {
            // Save to DB History
            await supabase.from('finance_history').insert({
                user_id: userId,
                month_data: newHistoryEntries,
                month_date: logDate
            });
            
            // Update local history state
            setHistory(prev => [...prev, ...newHistoryEntries]);
        }

        // Uncheck fixed expenses
        const { error: expError } = await supabase.from('finance_transactions')
            .update({ is_paid: false })
            .eq('user_id', userId)
            .eq('is_recurring_fixed', true);

        if (!expError) {
             setExpenses(prev => prev.map(exp => ({ ...exp, paid: false })));
        }

        // Clear shopping list
        const { error: shopError } = await supabase.from('finance_transactions')
            .delete()
            .eq('user_id', userId)
            .eq('is_shopping_item', true);
            
        if (!shopError) {
            setShoppingList([]);
        }

        // Reset cards
        const { error: cardError } = await supabase.from('finance_cards')
            .update({ paid_this_month: false })
            .eq('user_id', userId);
            
        if (!cardError) {
             setCards(prev => prev.map(c => ({ ...c, paidThisMonth: false })));
        }

        // Update Last Reset
        await supabase.from('finance_settings').update({ last_reset_month: currentMonth }).eq('user_id', userId);
    };

    const addExpense = async (expense) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        
        // Ensure value is a number
        const numericValue = typeof expense.value === 'string' 
            ? parseFloat(expense.value.replace(',', '.')) 
            : expense.value;

        const newExpense = { ...expense, id: tempId, paid: false, value: numericValue };
        setExpenses(prev => [...prev, newExpense]);

        const { data, error } = await supabase.from('finance_transactions').insert({
            user_id: user.id,
            type: 'expense',
            category: 'Fixo',
            title: expense.title,
            value: numericValue,
            is_recurring_fixed: true,
            is_paid: false
        }).select().single();

        if (data) {
            setExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id } : e));
        } else if (error) {
            console.error('Error adding expense:', error);
            // Show alert to user
            alert(`Erro ao salvar despesa: ${error.message}`);
            setExpenses(prev => prev.filter(e => e.id !== tempId));
        }
    };

    const toggleExpensePaid = async (id) => {
        if (!user) return;
        const exp = expenses.find(e => e.id === id);
        if (!exp) return;

        const newStatus = !exp.paid;
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: newStatus } : e));

        const { error } = await supabase.from('finance_transactions').update({ is_paid: newStatus }).eq('id', id);
        
        if (error) {
            console.error('Error updating expense status:', error);
            alert(`Erro ao atualizar status: ${error.message}`);
            // Rollback
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !newStatus } : e));
        }
    };

    const removeExpense = async (id) => {
        if (!user) return;
        setExpenses(prev => prev.filter(e => e.id !== id));
        await supabase.from('finance_transactions').delete().eq('id', id);
    };

    const addItemToShop = async (item) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        
        // Ensure value is a number
        const numericValue = typeof item.value === 'string' 
            ? parseFloat(item.value.replace(',', '.')) 
            : item.value;

        const newItem = { ...item, id: tempId, bought: true, value: numericValue || 0, date: new Date().toISOString() };
        setShoppingList(prev => [...prev, newItem]);

        const { data, error } = await supabase.from('finance_transactions').insert({
            user_id: user.id,
            type: 'expense',
            category: 'Compras',
            title: item.title,
            value: numericValue || 0,
            is_shopping_item: true,
            is_paid: true, // Bought immediately?
            date: newItem.date
        }).select().single();

        if (data) {
            setShoppingList(prev => prev.map(i => i.id === tempId ? { ...i, id: data.id } : i));
        } else if (error) {
            console.error('Error adding shopping item:', error);
            alert(`Erro ao salvar item de compra: ${error.message}`);
            setShoppingList(prev => prev.filter(i => i.id !== tempId));
        }
    };

    const toggleShopItem = (id) => { }; 

    const removeShopItem = async (id) => {
        if (!user) return;
        setShoppingList(prev => prev.filter(i => i.id !== id));
        await supabase.from('finance_transactions').delete().eq('id', id);
    };

    const addCardPurchase = async (purchase) => {
        if (!user) return;
        const tempId = `temp_${Date.now()}`;
        
        // Ensure value is a number
        const numericValue = typeof purchase.value === 'string' 
            ? parseFloat(purchase.value.replace(',', '.')) 
            : purchase.value;

        const newCard = { ...purchase, id: tempId, paidInstallments: 0, paidThisMonth: false, value: numericValue }; // use value in state
        setCards(prev => [...prev, newCard]);

        const { data, error } = await supabase.from('finance_cards').insert({
            user_id: user.id,
            title: purchase.title,
            total_value: numericValue,
            installments: purchase.installments,
            paid_installments: 0,
            paid_this_month: false
        }).select().single();

        if (data) {
             setCards(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
        } else if (error) {
             console.error('Error adding card purchase:', error);
             alert(`Erro ao salvar compra no cartão: ${error.message}`);
             setCards(prev => prev.filter(c => c.id !== tempId));
        }
    };

    const removeCardPurchase = async (id) => {
        if (!user) return;
        setCards(prev => prev.filter(c => c.id !== id));
        await supabase.from('finance_cards').delete().eq('id', id);
    };

    const payInstallment = async (id) => {
        if (!user) return;
        const card = cards.find(c => c.id === id);
        if (!card || card.paidInstallments >= card.installments) return;

        const nextInstallment = card.paidInstallments + 1;
        setCards(prev => prev.map(c => c.id === id ? { ...c, paidInstallments: nextInstallment, paidThisMonth: true } : c));

        await supabase.from('finance_cards').update({
            paid_installments: nextInstallment,
            paid_this_month: true
        }).eq('id', id);
    };

    const unpayInstallment = async (id) => {
        if (!user) return;
        const card = cards.find(c => c.id === id);
        if (!card || !card.paidThisMonth || card.paidInstallments <= 0) return;

        const prevInstallment = card.paidInstallments - 1;
        setCards(prev => prev.map(c => c.id === id ? { ...c, paidInstallments: prevInstallment, paidThisMonth: false } : c));

        await supabase.from('finance_cards').update({
            paid_installments: prevInstallment,
            paid_this_month: false
        }).eq('id', id);
    };

    const updateCardPurchase = async (id, updates) => {
        if (!user) return;
        
        // Optimistic update
        setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        const dbUpdates = {
            title: updates.title,
            total_value: updates.value,
            installments: updates.installments
        };

        const { error } = await supabase.from('finance_cards').update(dbUpdates).eq('id', id);

        if (error) {
            console.error('Error updating card:', error);
            alert(`Erro ao atualizar cartão: ${error.message}`);
            // Rollback could be implemented here by refetching or keeping previous state
        }
    };

    const updateReserve = async (newAmount) => {
        if (!user) return;
        setReserve(prev => ({ ...prev, current: newAmount }));
        await supabase.from('finance_settings').update({ reserve_current: newAmount }).eq('user_id', user.id);
    };

    const setReserveGoal = async (goal, deadline) => {
        if (!user) return;
        setReserve(prev => ({ ...prev, goal, deadline }));
        await supabase.from('finance_settings').update({
            reserve_goal: goal,
            reserve_deadline: deadline
        }).eq('user_id', user.id);
    };

    const setIncomeWrapper = async (newIncome) => {
        if (!user) return;
        setIncome(newIncome);
        await supabase.from('finance_settings').update({ monthly_income: newIncome }).eq('user_id', user.id);
    };

    return {
        income, setIncome: setIncomeWrapper, history,
        expenses, addExpense, toggleExpensePaid, removeExpense,
        shoppingList, addItemToShop, toggleShopItem, removeShopItem,
        cards, addCardPurchase, removeCardPurchase, payInstallment, unpayInstallment, updateCardPurchase,
        reserve, updateReserve, setReserveGoal
    };
};
