-- CORRECAO_GERAL_V2.sql
-- Script consolidado para corrigir TODOS os problemas de persistência e schema

-- 1. Corrigir tabela routine_tasks (Adicionar custom_days)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'custom_days') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN custom_days INTEGER[] DEFAULT '{}';
    END IF;
END $$;

-- Garantir que routine_tasks tem RLS habilitado
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;

-- Recriar politicas de routine_tasks para garantir acesso
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.routine_tasks;
CREATE POLICY "Users can manage their own tasks" ON public.routine_tasks
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Corrigir/Criar tabelas de Saúde (Health)

-- Tabela health_profiles
CREATE TABLE IF NOT EXISTS public.health_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC,
    starting_weight NUMERIC,
    bf NUMERIC,
    goal TEXT,
    target_weight NUMERIC,
    deadline_months INTEGER,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    rewarded_months INTEGER[] DEFAULT '{}',
    age INTEGER,
    height NUMERIC,
    sex TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own health profile" ON public.health_profiles;
CREATE POLICY "Users can manage their own health profile" ON public.health_profiles
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tabela health_diet_plans
CREATE TABLE IF NOT EXISTS public.health_diet_plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_diet_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own diet plan" ON public.health_diet_plans;
CREATE POLICY "Users can manage their own diet plan" ON public.health_diet_plans
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tabela health_workout_plans
CREATE TABLE IF NOT EXISTS public.health_workout_plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_workout_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own workout plan" ON public.health_workout_plans;
CREATE POLICY "Users can manage their own workout plan" ON public.health_workout_plans
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tabela health_weight_history
CREATE TABLE IF NOT EXISTS public.health_weight_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC NOT NULL,
    bf NUMERIC,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_weight_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own weight history" ON public.health_weight_history;
CREATE POLICY "Users can manage their own weight history" ON public.health_weight_history
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Garantir permissões para role authenticated
GRANT ALL ON TABLE public.routine_tasks TO authenticated;
GRANT ALL ON TABLE public.health_profiles TO authenticated;
GRANT ALL ON TABLE public.health_diet_plans TO authenticated;
GRANT ALL ON TABLE public.health_workout_plans TO authenticated;
GRANT ALL ON TABLE public.health_weight_history TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
