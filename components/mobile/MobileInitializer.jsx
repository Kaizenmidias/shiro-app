'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

const MobileInitializer = () => {
  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      initializeMobileFeatures();
    }
  }, []);

  const initializeMobileFeatures = async () => {
    try {
      // Hide Splash Screen explicitly if needed
      await SplashScreen.hide();

      // Handle App State Changes (Background/Foreground)
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Initialize Push Notifications
      initializePushNotifications();
    } catch (error) {
      console.error('Error initializing mobile features:', error);
    }
  };

  const initializePushNotifications = async () => {
    // Request permission to use push notifications
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('User denied push notifications permission');
      return;
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // TODO: Send this token to your backend (Supabase) to target this user
    });

    // Listen for registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on push registration: ' + JSON.stringify(error));
    });

    // Listen for push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
    });

    // Listen for push notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      // Navigate to specific page if needed
    });
  };

  return null; // This component doesn't render anything
};

export default MobileInitializer;
