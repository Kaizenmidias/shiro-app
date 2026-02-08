# Configuração do Git e GitHub - Guia Rápido

## Informações Necessárias

Para configurar o Git e fazer deploy, preciso que você me forneça:

### 1. Nome de Usuário do GitHub
Exemplo: `lucassilva`, `dev-lucas`, etc.

### 2. Email do GitHub
O email cadastrado na sua conta GitHub
Exemplo: `lucas@email.com`

### 3. Status do Repositório
- [ ] Já tenho um repositório criado no GitHub
- [ ] Preciso criar um novo repositório

---

## Próximos Passos (Após você fornecer as informações)

### 1. Configurar Git Localmente
```bash
git config --global user.name "SEU_NOME"
git config --global user.email "SEU_EMAIL"
```

### 2. Inicializar Repositório
```bash
git init
git add .
git commit -m "Initial commit - Shiro App"
```

### 3. Criar Personal Access Token (PAT)
Para autenticar no GitHub via terminal, você precisará de um token:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: `Shiro App Deploy`
4. Selecione os escopos:
   - ✅ `repo` (acesso completo a repositórios)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)

### 4. Conectar ao GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/shiro-app.git
git branch -M main
git push -u origin main
```

Quando pedir senha, use o **Personal Access Token** (não sua senha do GitHub).

---

## Alternativa: GitHub Desktop (Mais Fácil)

Se preferir uma interface gráfica:
1. Baixe: https://desktop.github.com/
2. Faça login com sua conta GitHub
3. Adicione o repositório local
4. Faça commit e push com cliques

---

## Aguardando suas informações...

Por favor, me forneça:
- Nome de usuário do GitHub
- Email do GitHub
- Se já tem repositório criado ou não
