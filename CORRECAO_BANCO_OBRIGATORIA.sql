-- ATENÇÃO: RODE ESTE SCRIPT NO SUPABASE SQL EDITOR PARA CORRIGIR TODOS OS ERROS
-- Este script resolve:
-- 1. Erro "column routine_tasks.order does not exist"
-- 2. Erros de "Failed to fetch" ou dados sumindo (problemas de permissão/RLS)
-- 3. Erros de tipo de dado em Finanças

-- PARTE 1: CORREÇÃO DE ESTRUTURA (COLUNAS)
DO $$
BEGIN
    -- Adicionar coluna 'order' em routine_tasks se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'order') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN "order" INTEGER DEFAULT 0;
    END IF;

    -- Garantir que colunas de valor sejam numéricas
    ALTER TABLE public.finance_transactions ALTER COLUMN value TYPE NUMERIC USING value::numeric;
    ALTER TABLE public.finance_cards ALTER COLUMN total_value TYPE NUMERIC USING total_value::numeric;
END $$;

-- PARTE 2: CORREÇÃO DE PERMISSÕES (RLS) - CRUCIAL PARA EVITAR ERROS DE REDE/FETCH
-- Habilita RLS em todas as tabelas
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para evitar conflitos e recria do zero
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.routine_tasks;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.finance_transactions;
DROP POLICY IF EXISTS "Users can manage their own finance settings" ON public.finance_settings;
DROP POLICY IF EXISTS "Users can manage their own cards" ON public.finance_cards;
DROP POLICY IF EXISTS "Users can manage their own finance history" ON public.finance_history;
DROP POLICY IF EXISTS "Users can manage their own health profile" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can manage their own diet plans" ON public.health_diet_plans;
DROP POLICY IF EXISTS "Users can manage their own workout plans" ON public.health_workout_plans;
DROP POLICY IF EXISTS "Users can manage their own weight history" ON public.health_weight_history;
DROP POLICY IF EXISTS "Users can manage their own game profile" ON public.user_game_profiles;

-- Cria políticas permissivas (CRUD completo para o dono do dado)
CREATE POLICY "Users can manage their own tasks" ON public.routine_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON public.finance_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own finance settings" ON public.finance_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cards" ON public.finance_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own finance history" ON public.finance_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own health profile" ON public.health_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own diet plans" ON public.health_diet_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own workout plans" ON public.health_workout_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own weight history" ON public.health_weight_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own game profile" ON public.user_game_profiles FOR ALL USING (auth.uid() = user_id);

-- Confirmação
SELECT 'Correção aplicada com sucesso! Agora atualize o site.' as status;
