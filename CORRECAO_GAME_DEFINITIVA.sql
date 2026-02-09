-- CORREÇÃO DEFINITIVA DE PERMISSÕES PARA GAME PROFILE
-- Rode este script no Supabase SQL Editor para corrigir o erro "net::ERR_ABORTED ... user_game_profiles"

-- 1. Criação da tabela user_game_profiles se não existir
CREATE TABLE IF NOT EXISTS public.user_game_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    next_level_xp INTEGER DEFAULT 1000,
    coins INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_login DATE,
    rank TEXT DEFAULT 'Novato',
    achievements JSONB DEFAULT '[]'::jsonb,
    unlocked_features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.user_game_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "Users can manage their own game profile" ON public.user_game_profiles;

-- 4. Criar políticas permissivas (SELECT, INSERT, UPDATE para o dono)
CREATE POLICY "Users can manage their own game profile" ON public.user_game_profiles 
    FOR ALL USING (auth.uid() = user_id);

-- 5. Garantir permissões de GRANT para o role authenticated
GRANT ALL ON TABLE public.user_game_profiles TO authenticated;

-- 6. Inserir perfil inicial se não existir para usuários atuais (opcional, mas ajuda)
-- INSERT INTO public.user_game_profiles (user_id)
-- SELECT id FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;

SELECT 'Correção de GAME PROFILE aplicada com sucesso! Recarregue o app.' as status;
