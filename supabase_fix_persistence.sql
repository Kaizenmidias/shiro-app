-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ROUTINE (Gestão Pessoal) - New Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.routine_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    time TEXT,
    frequency TEXT DEFAULT 'everyday', -- 'everyday', 'workdays', 'custom'
    custom_days JSONB DEFAULT '[]'::jsonb, -- Array of day indices [0, 1, 2...]
    completed BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for routine_tasks
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.routine_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.routine_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.routine_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.routine_tasks
    FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 2. FINANCE (Finanças) - Fix & Verify
-- ==========================================

-- Settings
CREATE TABLE IF NOT EXISTS public.finance_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    monthly_income NUMERIC DEFAULT 0,
    reserve_current NUMERIC DEFAULT 0,
    reserve_goal NUMERIC DEFAULT 10000,
    reserve_deadline INTEGER DEFAULT 12,
    last_reset_month INTEGER DEFAULT -1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own finance settings" ON public.finance_settings
    FOR ALL USING (auth.uid() = user_id);

-- Transactions (Expenses & Shopping)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'expense'
    category TEXT,
    title TEXT NOT NULL,
    value NUMERIC NOT NULL DEFAULT 0,
    is_recurring_fixed BOOLEAN DEFAULT FALSE,
    is_shopping_item BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT FALSE,
    date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON public.finance_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Cards
CREATE TABLE IF NOT EXISTS public.finance_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    total_value NUMERIC NOT NULL DEFAULT 0,
    installments INTEGER DEFAULT 1,
    paid_installments INTEGER DEFAULT 0,
    paid_this_month BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.finance_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cards" ON public.finance_cards
    FOR ALL USING (auth.uid() = user_id);

-- History
CREATE TABLE IF NOT EXISTS public.finance_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month_data JSONB DEFAULT '[]'::jsonb,
    month_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.finance_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own finance history" ON public.finance_history
    FOR ALL USING (auth.uid() = user_id);


-- ==========================================
-- 3. HEALTH (Saúde) - Fix & Verify
-- ==========================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.health_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    weight NUMERIC,
    starting_weight NUMERIC,
    bf NUMERIC,
    goal TEXT,
    target_weight NUMERIC,
    deadline_months INTEGER,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    rewarded_months JSONB DEFAULT '[]'::jsonb,
    age INTEGER,
    height NUMERIC,
    sex TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own health profile" ON public.health_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Diet Plans
CREATE TABLE IF NOT EXISTS public.health_diet_plans (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    plan_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.health_diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own diet plan" ON public.health_diet_plans
    FOR ALL USING (auth.uid() = user_id);

-- Workout Plans
CREATE TABLE IF NOT EXISTS public.health_workout_plans (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    plan_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.health_workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own workout plan" ON public.health_workout_plans
    FOR ALL USING (auth.uid() = user_id);

-- Weight History
CREATE TABLE IF NOT EXISTS public.health_weight_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC NOT NULL,
    bf NUMERIC,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.health_weight_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own weight history" ON public.health_weight_history
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 4. GAME (Gamificação) - Verify
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_game_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    username TEXT,
    avatar_url TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_game_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own game profile" ON public.user_game_profiles
    FOR ALL USING (auth.uid() = user_id);
