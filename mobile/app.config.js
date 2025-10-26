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
      EXPO_PUBLIC_PRO: process.env.EXPO_PUBLIC_PRO || 'false',
      EXPO_PUBLIC_API_URL_DEV: process.env.EXPO_PUBLIC_API_URL_DEV || 'http://localhost:4000',
      EXPO_PUBLIC_API_URL_PRO: process.env.EXPO_PUBLIC_API_URL_PRO || 'https://api.miservidor.com',
      EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'DuoChallenge',
      EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      
      eas: {
        projectId: 'tu-project-id',
      },
    },
    plugins: ['expo-secure-store'],
  },
};

