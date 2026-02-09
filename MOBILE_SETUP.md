# Guia de Configuração Mobile (Shiro App)

Este projeto foi configurado com **Capacitor** para funcionar como um aplicativo nativo (Android e iOS) carregando a versão web de produção.

## 1. Pré-requisitos
Para gerar os aplicativos finais, você precisará instalar:
- **Android Studio** (para Android)
- **Xcode** (para iOS - requer Mac)
- **Node.js** (já instalado)

## 2. Configuração Inicial

Já instalamos as dependências necessárias. As plataformas Android e iOS já foram inicializadas no projeto.

Para garantir que tudo está sincronizado, execute:

```bash
npx cap sync
```

> **Nota:** Se você tentar rodar `npx cap add android` ou `ios` e receber um erro "platform already exists", **isso é normal e significa que já está tudo pronto**. Apenas pule para o próximo passo.

> **Importante:** O Capacitor está configurado para usar a URL de produção. Certifique-se de que o deploy na Vercel foi concluído antes de testar o app nativo.

## 3. Ícone e Splash Screen
Para gerar ícones e telas de abertura automaticamente:

1. Coloque seu ícone (1024x1024px) em `resources/icon.png` (crie a pasta se não existir)
2. Coloque sua splash screen (2732x2732px) em `resources/splash.png`
3. Instale a ferramenta de assets (se ainda não tiver):
   ```bash
   npm install @capacitor/assets --save-dev
   ```
4. Gere os recursos:
   ```bash
   npx capacitor-assets generate
   ```

## 4. Configurar Push Notifications

### Android (Firebase)
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Adicione um app Android com o pacote `com.shiro.app`.
3. Baixe o arquivo `google-services.json` e coloque em `android/app/`.

### iOS (APNs)
1. No Firebase, adicione um app iOS.
2. Baixe o `GoogleService-Info.plist` e coloque em `ios/App/App/`.
3. No Xcode, vá em **Signing & Capabilities** e adicione:
   - Push Notifications
   - Background Modes (marque "Remote notifications")

## 5. Gerar Builds para Lojas

### Android (Google Play - .AAB)
1. Abra o projeto no Android Studio:
   ```bash
   npx cap open android
   ```
2. Vá em **Build > Generate Signed Bundle / APK**.
3. Escolha **Android App Bundle**.
4. Crie uma nova KeyStore (guarde a senha!).
5. Gere o arquivo `.aab` e suba no Google Play Console.

### iOS (App Store - .IPA)
1. Abra o projeto no Xcode:
   ```bash
   npx cap open ios
   ```
2. Selecione seu time de desenvolvimento em **Signing & Capabilities**.
3. Selecione o dispositivo "Any iOS Device (arm64)".
4. Vá em **Product > Archive**.
5. Quando terminar, clique em **Distribute App** para enviar ao App Store Connect.

## 6. Dicas para Aprovação nas Lojas (IMPORTANTE)

A Apple e o Google podem rejeitar apps que são apenas "sites empacotados". Para evitar isso:

1. **UX Nativa:** O app já possui animações e interface responsiva, o que ajuda.
2. **Push Notifications:** A integração que fizemos é um diferencial nativo importante.
3. **Login Persistente:** O Supabase manterá a sessão.
4. **Sem Links Externos:** Evite links que abram o navegador do sistema, a menos que necessário.

**Observação sobre a URL de Produção:**
No arquivo `capacitor.config.ts`, configuramos `server.url` para `https://shiro-app.vercel.app`.
*   **Vantagem:** Você atualiza o site e o app atualiza instantaneamente.
*   **Risco:** Se o site cair, o app quebra. Certifique-se de que a URL está correta.

## 7. Comandos Úteis

```bash
# Sincronizar alterações de configuração (plugins, ícones)
npx cap sync

# Abrir IDEs nativos
npx cap open android
npx cap open ios
```
