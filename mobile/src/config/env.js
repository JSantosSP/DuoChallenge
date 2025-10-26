/**
 * @file env.js - Configuración de entorno y URLs de la aplicación
 * @description Gestiona variables de entorno, URLs de API y utilidades de configuración
 */

import Constants from 'expo-constants';

/** Determina si está en modo producción desde variable de entorno */
const isProdFromEnv = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRO === 'true';

/** Detecta automáticamente el entorno (producción o desarrollo) */
const isProd = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRO !== undefined 
  ? isProdFromEnv 
  : !__DEV__;

/**
 * Objeto de configuración principal de la aplicación
 * @type {Object}
 * @property {boolean} isProd - Indica si está en modo producción
 * @property {boolean} isDev - Indica si está en modo desarrollo
 * @property {string} apiUrl - URL base de la API según entorno
 * @property {string} appName - Nombre de la aplicación
 * @property {string} appVersion - Versión de la aplicación
 */
export const config = {
  isProd,
  isDev: !isProd,
  
  apiUrl: isProd
    ? Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_PRO
    : Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_DEV,
  
  appName: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_NAME || 'DuoChallenge',
  appVersion: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

/** Exportaciones individuales de configuración */
export const API_URL = config.apiUrl;
export const IS_PROD = config.isProd;
export const IS_DEV = config.isDev;

/**
 * Construye la URL completa para una imagen
 * @param {string} imagePath - Ruta relativa o absoluta de la imagen
 * @returns {string|null} URL completa de la imagen o null si no hay ruta
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Construir URL completa con el API URL base
  return `${config.apiUrl}${imagePath}`;
};

/** Logging de configuración en modo desarrollo */
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

