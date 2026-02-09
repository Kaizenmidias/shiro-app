-- Script de Correção de Banco de Dados - Shiro App
-- Rode este script no Editor SQL do Supabase para corrigir os erros de colunas faltantes e permissões.

-- 1. Corrigir tabela routine_tasks (Adicionar coluna 'order' se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'order') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN "order" INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Garantir que as tabelas de Finanças tenham os tipos corretos
-- Converter colunas de valor para numeric se necessário, ou garantir que aceitem o formato enviado
ALTER TABLE public.finance_transactions ALTER COLUMN value TYPE NUMERIC USING value::numeric;
ALTER TABLE public.finance_cards ALTER COLUMN total_value TYPE NUMERIC USING total_value::numeric;

-- 3. Reforçar Políticas de Segurança (RLS) para todas as tabelas
-- Habilita RLS e cria políticas permissivas para o dono dos dados

-- Função auxiliar para criar políticas se não existirem
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(table_name text, policy_name text) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = table_name AND policyname = policy_name
    ) THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (auth.uid() = user_id)', policy_name, table_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar políticas
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('routine_tasks', 'Users can manage their own routine tasks');

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('finance_transactions', 'Users can manage their own transactions');

ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('finance_settings', 'Users can manage their own finance settings');

ALTER TABLE public.finance_cards ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('finance_cards', 'Users can manage their own cards');

ALTER TABLE public.finance_history ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('finance_history', 'Users can manage their own finance history');

ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('health_profiles', 'Users can manage their own health profile');

ALTER TABLE public.health_diet_plans ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('health_diet_plans', 'Users can manage their own diet plans');

ALTER TABLE public.health_workout_plans ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('health_workout_plans', 'Users can manage their own workout plans');

ALTER TABLE public.health_weight_history ENABLE ROW LEVEL SECURITY;
SELECT create_policy_if_not_exists('health_weight_history', 'Users can manage their own weight history');

-- 4. Correção para erro de permissão em sequências (se houver uso de serial, mas estamos usando UUID v4)
-- Garantir que uuid-ossp está ativado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. Limpeza de caches de schema (Opcional, mas bom para garantir)
NOTIFY pgrst, 'reload config';
