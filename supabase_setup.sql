-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Game Profile (Level, XP, Coins)
CREATE TABLE IF NOT EXISTS public.user_game_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    next_level_xp INTEGER DEFAULT 100,
    coins INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Health Profile (Physical stats)
CREATE TABLE IF NOT EXISTS public.health_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    sex TEXT,
    age INTEGER,
    height NUMERIC,
    weight NUMERIC,
    starting_weight NUMERIC,
    target_weight NUMERIC,
    goal TEXT, -- 'perder_peso', 'ganhar_massa', etc.
    activity_level TEXT,
    deadline_months INTEGER,
    water_goal INTEGER,
    sleep_goal INTEGER,
    bf NUMERIC,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    rewarded_months JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Weight History
CREATE TABLE IF NOT EXISTS public.health_weight_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC NOT NULL,
    bf NUMERIC,
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Diet Plans (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS public.health_diet_plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL, -- Stores meals, macros, calories
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Workout Plans (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS public.health_workout_plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL, -- Stores schedule, exercises
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Finance Settings
CREATE TABLE IF NOT EXISTS public.finance_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_income NUMERIC DEFAULT 0,
    reserve_current NUMERIC DEFAULT 0,
    reserve_goal NUMERIC DEFAULT 10000,
    reserve_deadline INTEGER DEFAULT 12,
    last_reset_month INTEGER DEFAULT -1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Finance Transactions (Expenses, Shopping, Income History)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'expense', 'income'
    category TEXT,
    title TEXT NOT NULL,
    value NUMERIC NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    is_paid BOOLEAN DEFAULT FALSE,
    is_shopping_item BOOLEAN DEFAULT FALSE, -- To distinguish shopping list items
    is_recurring_fixed BOOLEAN DEFAULT FALSE, -- For fixed monthly expenses
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Finance Cards
CREATE TABLE IF NOT EXISTS public.finance_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_value NUMERIC NOT NULL,
    installments INTEGER NOT NULL,
    paid_installments INTEGER DEFAULT 0,
    paid_this_month BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Finance History (Archived months)
CREATE TABLE IF NOT EXISTS public.finance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month_data JSONB NOT NULL, -- Stores the snapshot of that month
    month_date TIMESTAMPTZ NOT NULL, -- First day of the month
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Row Level Security)
ALTER TABLE public.user_game_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_history ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow users to CRUD their own data)

-- Game Profiles
CREATE POLICY "Users can select their own game profile" ON public.user_game_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own game profile" ON public.user_game_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own game profile" ON public.user_game_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Health Profiles
CREATE POLICY "Users can select their own health profile" ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health profile" ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health profile" ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Weight History
CREATE POLICY "Users can select their own weight history" ON public.health_weight_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weight history" ON public.health_weight_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weight history" ON public.health_weight_history FOR DELETE USING (auth.uid() = user_id);

-- Diet Plans
CREATE POLICY "Users can select their own diet plan" ON public.health_diet_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own diet plan" ON public.health_diet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own diet plan" ON public.health_diet_plans FOR UPDATE USING (auth.uid() = user_id);

-- Workout Plans
CREATE POLICY "Users can select their own workout plan" ON public.health_workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workout plan" ON public.health_workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout plan" ON public.health_workout_plans FOR UPDATE USING (auth.uid() = user_id);

-- Finance Settings
CREATE POLICY "Users can select their own finance settings" ON public.finance_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own finance settings" ON public.finance_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own finance settings" ON public.finance_settings FOR UPDATE USING (auth.uid() = user_id);

-- Finance Transactions
CREATE POLICY "Users can select their own transactions" ON public.finance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.finance_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.finance_transactions FOR DELETE USING (auth.uid() = user_id);

-- Finance Cards
CREATE POLICY "Users can select their own cards" ON public.finance_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cards" ON public.finance_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cards" ON public.finance_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cards" ON public.finance_cards FOR DELETE USING (auth.uid() = user_id);

-- Finance History
CREATE POLICY "Users can select their own finance history" ON public.finance_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own finance history" ON public.finance_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Safety updates for existing tables (Idempotent)
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.finance_settings ADD COLUMN IF NOT EXISTS last_reset_month INTEGER DEFAULT -1;
    EXCEPTION
        WHEN undefined_table THEN
            NULL; -- Ignore if table doesn't exist (it will be created by CREATE TABLE above)
    END;

    BEGIN
        ALTER TABLE public.user_game_profiles ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN undefined_table THEN
            NULL; -- Ignore if table doesn't exist
    END;
END $$;
