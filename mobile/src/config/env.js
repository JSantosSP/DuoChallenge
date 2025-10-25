import Constants from 'expo-constants';

// Obtener la variable PRO desde las configuraciones de Expo
const isProdFromEnv = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRO === 'true';

// Fallback: usar __DEV__ de React Native si no está configurado
const isProd = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRO !== undefined 
  ? isProdFromEnv 
  : !__DEV__;

export const config = {
  // Estado del entorno
  isProd,
  isDev: !isProd,
  
  // URLs
  apiUrl: isProd
    ? Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_PRO
    : Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_DEV,
  
  // App info
  appName: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_NAME || 'DuoChallenge',
  appVersion: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

// Exportaciones individuales para facilitar el uso
export const API_URL = config.apiUrl;
export const IS_PROD = config.isProd;
export const IS_DEV = config.isDev;

// Helper para convertir rutas de imagen relativas a URLs completas
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, agregar el base URL
  return `${config.apiUrl}${imagePath}`;
};

// Log de configuración (solo en desarrollo)
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

