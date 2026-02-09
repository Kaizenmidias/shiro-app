-- Script de configuração do Storage para o Shiro App
-- Execute este script no SQL Editor do seu projeto no Supabase (https://supabase.com/dashboard/project/_/sql)

-- 1. Cria o bucket 'avatars' se ele não existir
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Habilita RLS (Row Level Security) para segurança (geralmente já vem habilitado, mas garante)
-- alter table storage.objects enable row level security;

-- 3. Remove políticas antigas para evitar conflitos (opcional, mas recomendado para resetar permissões)
drop policy if exists "Imagens de avatar são públicas" on storage.objects;
drop policy if exists "Qualquer um pode fazer upload de avatar" on storage.objects;
drop policy if exists "Usuários podem atualizar seus próprios avatares" on storage.objects;

-- 4. Cria política de LEITURA PÚBLICA (qualquer um pode ver as imagens)
create policy "Imagens de avatar são públicas"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 5. Cria política de UPLOAD (qualquer usuário autenticado pode fazer upload)
create policy "Qualquer um pode fazer upload de avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

-- 6. Cria política de ATUALIZAÇÃO (usuários podem substituir arquivos)
create policy "Usuários podem atualizar seus próprios avatares"
  on storage.objects for update
  using ( bucket_id = 'avatars' );

-- FIM DO SCRIPT
