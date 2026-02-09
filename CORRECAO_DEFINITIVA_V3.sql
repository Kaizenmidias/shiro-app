-- CORRECAO_DEFINITIVA_V3.sql
-- Script para corrigir colunas faltantes e garantir integridade do schema

-- 1. Corrigir tabela routine_tasks (Adicionar frequency, custom_days, order)
DO $$
BEGIN
    -- Adicionar coluna 'frequency' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'frequency') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN frequency TEXT DEFAULT 'everyday';
    END IF;

    -- Adicionar coluna 'custom_days' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'custom_days') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN custom_days INTEGER[] DEFAULT '{}';
    END IF;

    -- Adicionar coluna 'order' se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'order') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN "order" INTEGER DEFAULT 0;
    END IF;

    -- Adicionar coluna 'time' se não existir (apenas para garantir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_tasks' AND column_name = 'time') THEN
        ALTER TABLE public.routine_tasks ADD COLUMN time TEXT;
    END IF;
END $$;

-- 2. Garantir permissões e RLS para routine_tasks
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.routine_tasks;
CREATE POLICY "Users can manage their own tasks" ON public.routine_tasks
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.routine_tasks TO authenticated;

-- 3. Verificar constraints na tabela finance_transactions (Opcional, mas bom para garantir)
-- Se houver problemas com NOT NULL em colunas que o app não envia, altere aqui.
-- O erro "null value in column title" foi corrigido no código (ShoppingTab.jsx), então o banco deve estar OK se 'title' é obrigatório.

-- 4. Recarregar Schema Cache (Instrução para o usuário: Vá em Settings > API > Reload Schema Cache se continuar dando erro 204)
