# Próximos Passos para Deploy

Como você já configurou as variáveis de ambiente na Vercel, agora só falta enviar o código atualizado para lá.

O repositório Git local já foi inicializado e as alterações foram salvas localmente (commit).

## 1. Conectar ao seu Repositório Remoto (GitHub)

Se você já tem um repositório criado no GitHub (conectado à Vercel), execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
```

*(Substitua `SEU_USUARIO` e `NOME_DO_REPO` pelos seus dados reais)*

**Se der erro dizendo que `remote origin already exists`**, use:
```bash
git remote set-url origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

## 2. Verificar o Deploy

Assim que você fizer o `git push`, a Vercel detectará a mudança e iniciará um novo deploy automaticamente.

Você pode acompanhar o progresso no dashboard da Vercel.

## 3. Configuração Importante no Supabase

Para garantir que o redirecionamento funcione corretamente (caso use confirmação de e-mail ou Magic Links futuramente), configure a URL do site no Supabase:

1. Vá em **Authentication > URL Configuration**
2. Em **Site URL**, coloque a URL do seu projeto na Vercel (ex: `https://shiro-app.vercel.app`)
3. Salve.
