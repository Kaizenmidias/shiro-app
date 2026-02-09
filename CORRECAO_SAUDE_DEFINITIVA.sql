-- CORREÇÃO DEFINITIVA DE PERMISSÕES E ESTRUTURA PARA SAÚDE E FINANÇAS
-- Rode este script no Supabase SQL Editor para corrigir os erros "Failed to fetch" e "net::ERR_ABORTED"

-- 1. Criação de tabelas que podem estar faltando
CREATE TABLE IF NOT EXISTS public.health_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC,
    starting_weight NUMERIC,
    target_weight NUMERIC,
    height NUMERIC,
    age NUMERIC,
    sex TEXT,
    goal TEXT,
    bf NUMERIC,
    deadline_months NUMERIC,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    rewarded_months JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_diet_plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_workout_plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_weight_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC,
    bf NUMERIC,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS em todas as tabelas relevantes
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_weight_history ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Users can manage their own health profile" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can manage their own diet plans" ON public.health_diet_plans;
DROP POLICY IF EXISTS "Users can manage their own workout plans" ON public.health_workout_plans;
DROP POLICY IF EXISTS "Users can manage their own weight history" ON public.health_weight_history;

-- 4. Criar políticas permissivas (SELECT, INSERT, UPDATE, DELETE para o dono)
CREATE POLICY "Users can manage their own health profile" ON public.health_profiles 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own diet plans" ON public.health_diet_plans 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout plans" ON public.health_workout_plans 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own weight history" ON public.health_weight_history 
    FOR ALL USING (auth.uid() = user_id);

-- 5. Garantir permissões de GRANT para o role authenticated (muito importante para "Failed to fetch")
GRANT ALL ON TABLE public.health_profiles TO authenticated;
GRANT ALL ON TABLE public.health_diet_plans TO authenticated;
GRANT ALL ON TABLE public.health_workout_plans TO authenticated;
GRANT ALL ON TABLE public.health_weight_history TO authenticated;
GRANT ALL ON SEQUENCE public.health_weight_history_id_seq TO authenticated; -- Se existir sequence implícita

SELECT 'Correção de SAÚDE aplicada com sucesso! Recarregue o app.' as status;
