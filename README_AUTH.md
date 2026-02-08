# Configuração de Autenticação com Supabase

A autenticação foi migrada de um mock local para o Supabase Auth.

## Passos para Configuração

1.  **Crie um projeto no Supabase**: Se ainda não tiver, crie em [supabase.com](https://supabase.com).
2.  **Obtenha as credenciais**: Vá em Project Settings > API.
3.  **Configure as variáveis de ambiente**:

    **Na Vercel:**
    Adicione as seguintes variáveis nas configurações do projeto:
    - `NEXT_PUBLIC_SUPABASE_URL`: Sua URL do projeto (ex: https://xyz.supabase.co)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Sua chave pública (anon)

    **Localmente:**
    Edite o arquivo `.env.local` na raiz do projeto e substitua os valores placeholder pelas suas credenciais reais.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
    ```

## Mudanças Realizadas

- **AuthContext**: Agora utiliza `supabase.auth` para gerenciar a sessão.
- **AuthScreen**: Login e Cadastro agora são reais. Erros de autenticação são exibidos na tela.
- **GameContext**: O nome do usuário é sincronizado automaticamente do cadastro.
- **Redirecionamento**: O "bug" de redirecionar sempre para "Lucas" foi corrigido. O sistema agora espera a autenticação real carregar.

## Observação sobre Dados

Atualmente, apenas a autenticação (usuário/senha) é salva no Supabase. Os dados do aplicativo (finanças, rotinas, etc.) ainda são salvos no armazenamento local do navegador (`localStorage`).
