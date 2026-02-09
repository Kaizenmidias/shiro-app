'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import nutritionDataRaw from '../data/nutritionData.json';

export const useHealth = () => {
    const { user } = useAuth();
    const {
        userAge, setUserAge,
        userHeight, setUserHeight,
        userSex, setUserSex
    } = useGame();

    const [mounted, setMounted] = useState(false);
    const [allNutritionData, setAllNutritionData] = useState([]);
    const [allExercises, setAllExercises] = useState([]);

    const [userData, setUserData] = useState({
        weight: '',
        startingWeight: '',
        bf: '',
        goal: 'perder_peso',
        targetWeight: '',
        deadline: '3',
        onboardingSet: false,
        rewardedMonths: [], // Track months for which rewards were given
    });

    const [weightHistory, setWeightHistory] = useState([]);
    const [dietPlan, setDietPlan] = useState(null);
    const [workoutPlan, setWorkoutPlan] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('gamification_health_user');
        const savedDiet = localStorage.getItem('gamification_health_diet');
        const savedWorkout = localStorage.getItem('gamification_health_workout');
        const savedHistory = localStorage.getItem('gamification_health_history');
        const savedNutrition = localStorage.getItem('gamification_health_nutrition');
        const savedExercises = localStorage.getItem('shiro_health_exercises');

        if (savedNutrition) {
            setAllNutritionData(JSON.parse(savedNutrition));
        } else {
            setAllNutritionData(nutritionDataRaw);
            localStorage.setItem('gamification_health_nutrition', JSON.stringify(nutritionDataRaw));
        }

        if (savedExercises) {
            setAllExercises(JSON.parse(savedExercises));
        }

        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUserData(prev => ({
                ...prev,
                ...parsed,
                rewardedMonths: parsed.rewardedMonths || []
            }));
        }

        if (savedDiet) {
            let plan = JSON.parse(savedDiet);

            // MIGRATION: Auto-repair items with missing macros
            if (plan && plan.meals) {
                let needsUpdate = false;
                const updatedMeals = plan.meals.map(meal => {
                    const updatedItems = meal.items.map(item => {
                        // If it's a known food and missing macros
                        if (item.id && !item.id.startsWith('custom_') && (item.protein === undefined || item.protein === 0)) {
                            const food = allNutritionData.find(f => f.id === item.id);
                            if (food && food.protein !== undefined) {
                                needsUpdate = true;
                                const ratio = (food.unit === 'g' || food.unit.includes('100ml')) ? item.amount / 100 : item.amount;
                                return {
                                    ...item,
                                    protein: parseFloat((food.protein * ratio).toFixed(1)),
                                    carbs: parseFloat((food.carbs * ratio).toFixed(1)),
                                    fats: parseFloat((food.fats * ratio).toFixed(1))
                                };
                            }
                        }
                        return item;
                    });

                    if (needsUpdate) {
                        return {
                            ...meal,
                            items: updatedItems,
                            calories: updatedItems.reduce((sum, i) => sum + (i.calSum || 0), 0),
                            protein: parseFloat(updatedItems.reduce((sum, i) => sum + (i.protein || 0), 0).toFixed(1)),
                            carbs: parseFloat(updatedItems.reduce((sum, i) => sum + (i.carbs || 0), 0).toFixed(1)),
                            fats: parseFloat(updatedItems.reduce((sum, i) => sum + (i.fats || 0), 0).toFixed(1))
                        };
                    }
                    return meal;
                });

                if (needsUpdate) {
                    plan = { ...plan, meals: updatedMeals };
                    setDietPlan(plan);
                    localStorage.setItem('gamification_health_diet', JSON.stringify(plan));
                } else {
                    setDietPlan(plan);
                }
            } else {
                setDietPlan(plan);
            }
        }

        if (savedWorkout) {
            let wp = JSON.parse(savedWorkout);
            if (wp && wp.schedule) {
                let needsUpdate = false;
                Object.keys(wp.schedule).forEach(day => {
                    if (wp.schedule[day] === 'Rest') {
                        wp.schedule[day] = 'Descanso';
                        needsUpdate = true;
                    }
                });
                if (needsUpdate) {
                    setWorkoutPlan(wp);
                    localStorage.setItem('gamification_health_workout', JSON.stringify(wp));
                } else {
                    setWorkoutPlan(wp);
                }
            } else {
                setWorkoutPlan(wp);
            }
        }
        if (savedHistory) setWeightHistory(JSON.parse(savedHistory));

        // Set mounted LAST to allow initial load to finish before auto-saving kicks in
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) localStorage.setItem('gamification_health_nutrition', JSON.stringify(allNutritionData));
    }, [allNutritionData, mounted]);

    useEffect(() => {
        if (mounted) localStorage.setItem('shiro_health_exercises', JSON.stringify(allExercises));
    }, [allExercises, mounted]);

    useEffect(() => {
        if (mounted) localStorage.setItem('gamification_health_diet', JSON.stringify(dietPlan));
    }, [dietPlan, mounted]);

    useEffect(() => {
        if (mounted) localStorage.setItem('gamification_health_workout', JSON.stringify(workoutPlan));
    }, [workoutPlan, mounted]);

    useEffect(() => {
        if (mounted) localStorage.setItem('gamification_health_history', JSON.stringify(weightHistory));
    }, [weightHistory, mounted]);

    // Sync with Supabase Auth Metadata
    useEffect(() => {
        if (user?.user_metadata) {
            const meta = user.user_metadata;
            setUserData(prev => ({
                ...prev,
                weight: meta.weight || prev.weight,
                startingWeight: meta.startingWeight || meta.weight || prev.startingWeight,
                goal: meta.goal || prev.goal,
                targetWeight: meta.targetWeight || prev.targetWeight,
                deadline: meta.deadline || prev.deadline,
                onboardingSet: meta.onboardingSet || (!!meta.weight && !!meta.height),
            }));
            
            // Sync GameContext values if they are missing locally but exist in auth
            if (meta.age && userAge !== meta.age) setUserAge(meta.age);
            if (meta.height && userHeight !== meta.height) setUserHeight(meta.height);
            if (meta.sex && userSex !== meta.sex) setUserSex(meta.sex);

            // Sync complex objects from cloud if available
            if (meta.dietPlan) {
                // Check deep equality to avoid loop
                if (JSON.stringify(dietPlan) !== JSON.stringify(meta.dietPlan)) {
                    setDietPlan(meta.dietPlan);
                }
            }
            if (meta.workoutPlan) {
                 if (JSON.stringify(workoutPlan) !== JSON.stringify(meta.workoutPlan)) {
                    setWorkoutPlan(meta.workoutPlan);
                 }
            }
            if (meta.weightHistory) {
                 if (JSON.stringify(weightHistory) !== JSON.stringify(meta.weightHistory)) {
                    setWeightHistory(meta.weightHistory);
                 }
            }
        }
    }, [user, setUserAge, setUserHeight, setUserSex]);

    // Sync Health Data to Supabase
    useEffect(() => {
        if (mounted && user) {
            const timer = setTimeout(() => {
                const meta = user.user_metadata || {};
                
                // Only update if there are changes to avoid loop
                const dietChanged = JSON.stringify(dietPlan) !== JSON.stringify(meta.dietPlan);
                const workoutChanged = JSON.stringify(workoutPlan) !== JSON.stringify(meta.workoutPlan);
                const historyChanged = JSON.stringify(weightHistory) !== JSON.stringify(meta.weightHistory);

                if (dietChanged || workoutChanged || historyChanged) {
                    supabase.auth.updateUser({
                        data: {
                            dietPlan,
                            workoutPlan,
                            weightHistory
                        }
                    }).catch(err => console.error('Failed to sync health stats:', err));
                }
            }, 4000); // 4s debounce
            return () => clearTimeout(timer);
        }
    }, [dietPlan, workoutPlan, weightHistory, user, mounted]);

    const updateUserData = async (data) => {
        setUserData(prev => ({ ...prev, ...data }));
        if (user) {
            await supabase.auth.updateUser({
                data: data
            });
        }
    };

    const getWeightRoadmap = () => {
        // Fallback for users who don't have startingWeight set yet
        const start = parseFloat(userData.startingWeight) ||
            (weightHistory.length > 0 ? parseFloat(weightHistory[weightHistory.length - 1].weight) : parseFloat(userData.weight));

        if (!start || !userData.targetWeight || !userData.deadline) return [];

        const target = parseFloat(userData.targetWeight);
        const months = parseInt(userData.deadline);
        const totalDiff = target - start;
        const monthlyDiff = totalDiff / months;

        const roadmap = [];
        for (let i = 1; i <= months; i++) {
            roadmap.push({
                month: i,
                target: (start + (monthlyDiff * i)).toFixed(1)
            });
        }
        return roadmap;
    };

    const completeOnboarding = async (data) => {
        setUserAge(data.age);
        setUserHeight(data.height);
        setUserSex(data.sex);

        const updates = {
            weight: data.weight,
            startingWeight: data.weight,
            onboardingSet: true,
            age: data.age,
            height: data.height,
            sex: data.sex
        };

        setUserData(prev => ({
            ...prev,
            ...updates
        }));

        if (user) {
            await supabase.auth.updateUser({
                data: updates
            });
        }

        // Add initial record to history
        updateWeight(data.weight);
    };

    const updateWeight = async (newWeight, newBf = '') => {
        const record = {
            date: new Date().toISOString(),
            weight: newWeight,
            bf: newBf
        };

        setWeightHistory(prev => [record, ...prev]);

        // Update current weight in profile
        setUserData(prev => ({ ...prev, weight: newWeight }));

        if (user) {
            await supabase.auth.updateUser({
                data: { weight: newWeight }
            });
        }

        // Calculate milestone rewards OUTSIDE state updater to avoid React loop
        const newlyRewardedMonths = [];
        if (userData.onboardingSet && userData.targetWeight && userData.deadline) {
            const roadmap = getWeightRoadmap();
            const currentWeight = parseFloat(newWeight);
            const startWeight = parseFloat(userData.startingWeight) ||
                (weightHistory.length > 0 ? parseFloat(weightHistory[weightHistory.length - 1].weight) : parseFloat(userData.weight));
            const isLosing = userData.goal === 'perder_peso';

            roadmap.forEach(milestone => {
                if (!userData.rewardedMonths.includes(milestone.month)) {
                    const target = parseFloat(milestone.target);
                    const reached = isLosing ? currentWeight <= target : currentWeight >= target;
                    if (reached) {
                        newlyRewardedMonths.push(milestone);
                    }
                }
            });
        }

        setUserData(prev => ({
            ...prev,
            weight: newWeight,
            bf: newBf || prev.bf,
            rewardedMonths: [...(prev.rewardedMonths || []), ...newlyRewardedMonths.map(m => m.month)]
        }));
    };

    const calculateTMB = () => {
        if (!userData.weight || !userHeight || !userAge) return 0;
        const w = parseFloat(userData.weight);
        const h = parseFloat(userHeight);
        const a = parseFloat(userAge);

        if (userSex === 'male') {
            return 88.36 + (13.4 * w) + (4.8 * h) - (5.7 * a);
        } else {
            return 447.6 + (9.2 * w) + (3.1 * h) - (4.3 * a);
        }
    };

    const generateDiet = () => {
        const tmb = calculateTMB();
        let calories = tmb;
        if (userData.goal === 'perder_peso') calories -= 500;
        if (userData.goal === 'ganhar_massa') calories += 300;

        const totalCals = Math.round(calories);
        const proteinGoal = userData.goal === 'ganhar_massa' ? 2.0 * userData.weight : 1.6 * userData.weight;
        const fatsGoal = 0.8 * userData.weight;
        const carbsGoal = (totalCals - (proteinGoal * 4) - (fatsGoal * 9)) / 4;

        // Helper to find food and calculate macros
        const getFoodWithMacros = (id, amount) => {
            const food = allNutritionData.find(f => f.id === id);
            if (!food) return null;

            // Simple rule: if unit is 'g' or '100ml', calc is per 100.
            const ratio = (food.unit === 'g' || food.unit.includes('100ml')) ? amount / 100 : amount;

            return {
                ...food,
                amount,
                calSum: Math.round(food.calories * ratio),
                protein: parseFloat((food.protein * ratio).toFixed(1)),
                carbs: parseFloat((food.carbs * ratio).toFixed(1)),
                fats: parseFloat((food.fats * ratio).toFixed(1))
            };
        };

        const newPlan = {
            calories: totalCals,
            macros: {
                protein: Math.round(proteinGoal),
                carbs: Math.round(carbsGoal),
                fats: Math.round(fatsGoal)
            },
            meals: [
                {
                    name: 'Café da Manhã',
                    time: '08:00',
                    items: [
                        getFoodWithMacros('ovo_cozido', 2),
                        getFoodWithMacros('pao_integral', 2),
                        getFoodWithMacros('banana_prata', 1)
                    ],
                    calories: 365
                },
                {
                    name: 'Almoço',
                    time: '12:00',
                    items: [
                        getFoodWithMacros('arroz_branco', 150),
                        getFoodWithMacros('feijao_carioca', 100),
                        getFoodWithMacros('frango_grelhado', 150),
                        getFoodWithMacros('alface', 50),
                        getFoodWithMacros('tomate', 1)
                    ],
                    calories: 544
                },
                {
                    name: 'Lanche',
                    time: '16:00',
                    items: [
                        getFoodWithMacros('iogurte_natural', 1),
                        getFoodWithMacros('maca', 1)
                    ],
                    calories: 178
                },
                {
                    name: 'Jantar',
                    time: '20:00',
                    items: [
                        getFoodWithMacros('patinho_moido', 150),
                        getFoodWithMacros('cuscuz', 100),
                        getFoodWithMacros('azeite', 1)
                    ],
                    calories: 530
                }
            ]
        };

        // Recalculate meal totals to be safe and remove missing items
        newPlan.meals = newPlan.meals.map(meal => {
            const validItems = meal.items.filter(Boolean);
            return {
                ...meal,
                time: meal.time || '12:00', // Ensure time exists
                items: validItems,
                calories: validItems.reduce((sum, i) => sum + i.calSum, 0),
                protein: parseFloat(validItems.reduce((sum, i) => sum + (i.protein || 0), 0).toFixed(1)),
                carbs: parseFloat(validItems.reduce((sum, i) => sum + (i.carbs || 0), 0).toFixed(1)),
                fats: parseFloat(validItems.reduce((sum, i) => sum + (i.fats || 0), 0).toFixed(1))
            };
        });

        setDietPlan(newPlan);
    };

    const generateWorkout = (daysPerWeek = 3) => {
        const sex = userSex || 'male';

        // Split Definitions based on gym-centric beginner focus
        const gymWorkouts = {
            male: {
                A: {
                    name: 'Peito e Tríceps',
                    exercises: [
                        { name: 'Supino na Máquina', sets: '3', reps: '12', completed: false },
                        { name: 'Voador (Peck Deck)', sets: '3', reps: '12', completed: false },
                        { name: 'Supino com Halteres', sets: '3', reps: '10', completed: false },
                        { name: 'Tríceps Pulley (Corda)', sets: '3', reps: '12', completed: false },
                        { name: 'Tríceps Testa com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Cardio: Esteira', sets: '1', reps: '15 min', completed: false }
                    ]
                },
                B: {
                    name: 'Costas e Bíceps',
                    exercises: [
                        { name: 'Puxada Alta (Máquina)', sets: '3', reps: '12', completed: false },
                        { name: 'Remada Sentada (Máquina)', sets: '3', reps: '12', completed: false },
                        { name: 'Puxada Pulldown', sets: '3', reps: '12', completed: false },
                        { name: 'Rosca Direta com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Rosca Martelo com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Cardio: Bicicleta', sets: '1', reps: '15 min', completed: false }
                    ]
                },
                C: {
                    name: 'Pernas e Glúteos',
                    exercises: [
                        { name: 'Leg Press 45', sets: '3', reps: '12', completed: false },
                        { name: 'Cadeira Extensora', sets: '3', reps: '15', completed: false },
                        { name: 'Cadeira Flexora', sets: '3', reps: '15', completed: false },
                        { name: 'Elevação Pélvica (Máquina)', sets: '3', reps: '12', completed: false },
                        { name: 'Panturrilha Sentado', sets: '4', reps: '15', completed: false },
                        { name: 'Cardio: Elíptico', sets: '1', reps: '15 min', completed: false }
                    ]
                }
            },
            female: {
                A: {
                    name: 'Posterior e Glúteo',
                    exercises: [
                        { name: 'Cadeira Flexora', sets: '3', reps: '15', completed: false },
                        { name: 'Mesa Flexora', sets: '3', reps: '15', completed: false },
                        { name: 'Stiff com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Elevação Pélvica (Máquina)', sets: '4', reps: '12', completed: false },
                        { name: 'Cadeira Abdutora', sets: '3', reps: '15', completed: false },
                        { name: 'Cardio: Escada', sets: '1', reps: '15 min', completed: false }
                    ]
                },
                B: {
                    name: 'Costas e Bíceps',
                    exercises: [
                        { name: 'Puxada Alta', sets: '3', reps: '12', completed: false },
                        { name: 'Remada Sentada (Máquina)', sets: '3', reps: '12', completed: false },
                        { name: 'Extensão de Lombar (Máquina)', sets: '3', reps: '15', completed: false },
                        { name: 'Rosca Martelo com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Rosca Direta com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Cardio: Bicicleta', sets: '1', reps: '15 min', completed: false }
                    ]
                },
                C: {
                    name: 'Quadríceps e Glúteo',
                    exercises: [
                        { name: 'Leg Press Horizontal', sets: '3', reps: '12', completed: false },
                        { name: 'Cadeira Extensora', sets: '3', reps: '15', completed: false },
                        { name: 'Afundo com Halteres', sets: '3', reps: '10 cada', completed: false },
                        { name: 'Agachamento Sumô com Halter', sets: '3', reps: '15', completed: false },
                        { name: 'Panturrilha em Pé', sets: '3', reps: '15', completed: false },
                        { name: 'Cardio: Esteira', sets: '1', reps: '10 min', completed: false }
                    ]
                },
                D: {
                    name: 'Peito e Tríceps',
                    exercises: [
                        { name: 'Supino na Máquina', sets: '3', reps: '12', completed: false },
                        { name: 'Voador (Peck Deck)', sets: '3', reps: '12', completed: false },
                        { name: 'Desenvolvimento com Halteres', sets: '3', reps: '12', completed: false },
                        { name: 'Tríceps Pulley', sets: '3', reps: '15', completed: false },
                        { name: 'Tríceps Corda', sets: '3', reps: '15', completed: false },
                        { name: 'Abdominal Supra', sets: '3', reps: '20', completed: false }
                    ]
                }
            }
        };

        const activeWorkouts = sex === 'male' ? gymWorkouts.male : gymWorkouts.female;
        const workoutKeys = Object.keys(activeWorkouts); // ['A', 'B', 'C'] or ['A', 'B', 'C', 'D']

        const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const schedule = {};

        let activeDaysMapping = [];
        if (daysPerWeek === 3) activeDaysMapping = [0, 2, 4];
        else if (daysPerWeek === 4) activeDaysMapping = [0, 1, 3, 4];
        else if (daysPerWeek === 5) activeDaysMapping = [0, 1, 2, 3, 4];
        else if (daysPerWeek === 6) activeDaysMapping = [0, 1, 2, 3, 4, 5];
        else activeDaysMapping = [0, 1, 2, 3, 4, 5, 6];

        let currentKeyIdx = 0;
        days.forEach((day, idx) => {
            if (activeDaysMapping.includes(idx)) {
                schedule[day] = workoutKeys[currentKeyIdx % workoutKeys.length];
                currentKeyIdx++;
            } else {
                schedule[day] = 'Descanso';
            }
        });

        const newPlan = {
            daysPerWeek,
            schedule,
            workouts: activeWorkouts,
            completedData: {}
        };

        setWorkoutPlan(newPlan);
    };


    const toggleExercise = (dateKey, type, exerciseIdx) => {
        setWorkoutPlan(prev => {
            if (!prev) return prev;
            const newCompletedData = { ...prev.completedData };
            const dayData = { ...(newCompletedData[dateKey] || {}) };
            const typeList = [...(dayData[type] || [])];

            if (typeList.includes(exerciseIdx)) {
                dayData[type] = typeList.filter(i => i !== exerciseIdx);
            } else {
                dayData[type] = [...typeList, exerciseIdx];
            }

            newCompletedData[dateKey] = dayData;
            return { ...prev, completedData: newCompletedData };
        });
    };

    const renameWorkout = (type, newName) => {
        setWorkoutPlan(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                workouts: {
                    ...prev.workouts,
                    [type]: { ...prev.workouts[type], name: newName }
                }
            };
        });
    };

    const updateWorkoutExercises = (type, exercises) => {
        setWorkoutPlan(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                workouts: {
                    ...prev.workouts,
                    [type]: {
                        ...prev.workouts[type],
                        exercises: exercises
                    }
                }
            };
        });
    };

    const addNutritionItem = (item) => {
        setAllNutritionData(prev => [...prev, { ...item, id: `custom_${Date.now()}` }]);
    };

    const removeNutritionItem = (id) => {
        setAllNutritionData(prev => prev.filter(item => item.id !== id));
    };

    const addExercise = (exercise) => {
        setAllExercises(prev => [...prev, { ...exercise, id: `exercise_${Date.now()}` }]);
    };

    const removeExercise = (id) => {
        setAllExercises(prev => prev.filter(ex => ex.id !== id));
    };

    return {
        userData,
        profileData: { age: userAge, height: userHeight, sex: userSex },
        weightHistory,
        updateUserData,
        completeOnboarding,
        updateWeight,
        calculateTMB,
        getWeightRoadmap,
        dietPlan,
        setDietPlan,
        generateDiet,
        workoutPlan,
        setWorkoutPlan,
        generateWorkout,
        toggleExercise,
        renameWorkout,
        updateWorkoutExercises,
        allNutritionData,
        setAllNutritionData,
        addNutritionItem,
        removeNutritionItem,
        allExercises,
        addExercise,
        removeExercise,
        mounted
    };
};
