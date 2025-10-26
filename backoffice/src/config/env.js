
const isProd = import.meta.env.VITE_PRO === 'true';

export const config = {
  isProd,
  apiUrl: isProd
    ? import.meta.env.VITE_API_URL_PRO
    : import.meta.env.VITE_API_URL_DEV,
  appName: import.meta.env.VITE_APP_NAME || 'DuoChallenge Backoffice',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

export const API_URL = config.apiUrl;
export const IS_PROD = config.isProd;

if (!isProd) {
  console.log('📋 Configuración del Backoffice:');
  console.log(`   Entorno: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   App: ${config.appName} v${config.appVersion}`);
}

export default config;

