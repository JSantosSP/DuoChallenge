/**
 * App Config para Expo
 * 
 * Este archivo reemplaza app.json para permitir configuración dinámica
 * basada en variables de entorno (.env)
 * 
 * Las variables EXPO_PUBLIC_* son accesibles desde:
 * - Constants.expoConfig.extra en React Native
 * - process.env en el código de la app (solo las que comienzan con EXPO_PUBLIC_)
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
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.duochallenge.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F5F8F6',
      },
      package: 'com.duochallenge.mobile',
      permissions: ['android.permission.INTERNET'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      // Variables de entorno personalizadas
      // Estas estarán disponibles en Constants.expoConfig.extra
      EXPO_PUBLIC_PRO: process.env.EXPO_PUBLIC_PRO || 'false',
      EXPO_PUBLIC_API_URL_DEV: process.env.EXPO_PUBLIC_API_URL_DEV || 'http://localhost:4000',
      EXPO_PUBLIC_API_URL_PRO: process.env.EXPO_PUBLIC_API_URL_PRO || 'https://api.miservidor.com',
      EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'DuoChallenge',
      EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      
      // EAS (si lo usas en el futuro)
      eas: {
        projectId: 'tu-project-id',
      },
    },
    plugins: ['expo-secure-store'],
  },
};

