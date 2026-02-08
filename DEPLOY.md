# Guia de Deploy - Shiro App

## Opção 1: Vercel (Recomendado) ⭐

### Pré-requisitos
- Conta no GitHub
- Conta na Vercel (gratuita)

### Passos

#### 1. Preparar o Projeto
```bash
# Certifique-se de que o build funciona localmente
npm run build

# Inicializar Git (se ainda não estiver)
git init
git add .
git commit -m "Shiro App - Ready for production"
```

#### 2. Criar Repositório no GitHub
1. Acesse https://github.com/new
2. Crie um repositório (público ou privado)
3. Conecte seu projeto local:
```bash
git remote add origin https://github.com/SEU_USUARIO/shiro-app.git
git branch -M main
git push -u origin main
```

#### 3. Deploy na Vercel
1. Acesse https://vercel.com
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure (a Vercel detecta Next.js automaticamente):
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Clique em "Deploy"

#### 4. Configurações Adicionais (Opcional)
- **Domínio Personalizado**: Settings → Domains
- **Variáveis de Ambiente**: Settings → Environment Variables

**Pronto!** Seu app estará em: `https://seu-projeto.vercel.app`

---

## Opção 2: Netlify

### Passos
1. Acesse https://netlify.com
2. "Add new site" → "Import an existing project"
3. Conecte GitHub e selecione o repositório
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Deploy!

---

## Opção 3: VPS/Servidor Próprio (DigitalOcean, AWS, etc.)

### Requisitos
- Servidor com Node.js 18+
- PM2 para gerenciamento de processos
- Nginx como reverse proxy

### Passos

#### 1. Preparar o Servidor
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx
```

#### 2. Fazer Upload do Projeto
```bash
# No seu computador local
npm run build
scp -r ./* usuario@seu-servidor:/var/www/shiro-app/
```

#### 3. Configurar PM2
```bash
# No servidor
cd /var/www/shiro-app
npm install --production
pm2 start npm --name "shiro-app" -- start
pm2 save
pm2 startup
```

#### 4. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/shiro-app
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/shiro-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL com Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## Checklist Pré-Deploy

- [ ] Testar build local: `npm run build`
- [ ] Verificar se não há erros no console
- [ ] Testar em modo produção local: `npm start`
- [ ] Commitar todas as mudanças no Git
- [ ] Verificar se `.env` está no `.gitignore` (se houver variáveis sensíveis)
- [ ] Documentar credenciais do admin (admin/shiro2026)

## Pós-Deploy

### Monitoramento
- Vercel/Netlify: Dashboard integrado com analytics
- VPS: Configurar PM2 logs (`pm2 logs shiro-app`)

### Atualizações
- **Vercel/Netlify**: Apenas faça `git push` → deploy automático
- **VPS**: 
  ```bash
  git pull
  npm install
  npm run build
  pm2 restart shiro-app
  ```

## Notas Importantes

⚠️ **localStorage**: O app usa `localStorage` para persistência. Em produção, considere migrar para um banco de dados real (MongoDB, PostgreSQL, etc.) para dados críticos.

⚠️ **Credenciais Admin**: Altere a senha padrão do admin em produção editando `contexts/AdminContext.jsx`.

⚠️ **Domínio Personalizado**: Tanto Vercel quanto Netlify permitem configurar domínios personalizados gratuitamente.

## Suporte

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Next.js Deployment: https://nextjs.org/docs/deployment
