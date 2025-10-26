/**
 * @file app.config.js - Configuración de Expo para la aplicación móvil
 * @description Define metadatos, configuraciones de plataforma (iOS/Android), variables de entorno y plugins
 */

module.exports = {
  expo: {
    name: 'DuoChallenge',
    slug: 'duochallenge',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#F5F8F6',
    },
    assetBundlePatterns: ['**/*'],
    
    /** Configuración específica para iOS */
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.duochallenge.mobile',
    },
    
    /** Configuración específica para Android */
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F5F8F6',
      },
      package: 'com.duochallenge.mobile',
      permissions: ['android.permission.INTERNET'],
    },
    
    /** Configuración para Web */
    web: {
      favicon: './assets/favicon.png',
    },
    
    /** Variables de entorno y configuración extra */
    extra: {
      EXPO_PUBLIC_PRO: process.env.EXPO_PUBLIC_PRO || 'false',
      EXPO_PUBLIC_API_URL_DEV: process.env.EXPO_PUBLIC_API_URL_DEV || 'http://localhost:4000',
      EXPO_PUBLIC_API_URL_PRO: process.env.EXPO_PUBLIC_API_URL_PRO || 'https://api.miservidor.com',
      EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'DuoChallenge',
      EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      
      eas: {
        projectId: 'eb805f0d-a2dc-4ee3-ac14-61e18a669650',
      },
    },
    
    /** Plugins de Expo utilizados en la aplicación */
    plugins: ['expo-secure-store'],
  },
};

