import Constants from 'expo-constants';

const isProdFromEnv = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRO === 'true';

const isProd = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRO !== undefined 
  ? isProdFromEnv 
  : !__DEV__;

export const config = {
  isProd,
  isDev: !isProd,
  
  apiUrl: isProd
    ? Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_PRO
    : Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_DEV,
  
  appName: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_NAME || 'DuoChallenge',
  appVersion: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

export const API_URL = config.apiUrl;
export const IS_PROD = config.isProd;
export const IS_DEV = config.isDev;

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  return `${config.apiUrl}${imagePath}`;
};

if (!isProd && __DEV__) {
  console.log('📋 Configuración de la App Móvil:');
  console.log(`   Entorno: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   App: ${config.appName} v${config.appVersion}`);
  
  if (!config.apiUrl) {
    console.warn('⚠️ ADVERTENCIA: API_URL no está configurada correctamente.');
    console.warn('   Verifica que app.json tenga las variables en "extra".');
  }
}

export default config;

