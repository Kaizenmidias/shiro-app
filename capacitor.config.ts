import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shiro.app',
  appName: 'Shiro App',
  webDir: 'out',
  server: {
    // ATENÇÃO: Substitua pela URL de produção do seu app na Vercel
    url: 'https://shiro-app.vercel.app',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      'shiro-app.vercel.app',
      '*.supabase.co'
    ]
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      iosSplashResourceName: "splash",
      showSpinner: true,
      spinnerColor: "#999999"
    }
  }
};

export default config;
