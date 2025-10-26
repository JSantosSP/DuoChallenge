/**
 * @fileoverview Configuración centralizada del backend
 * @description Carga y valida todas las variables de entorno necesarias para el funcionamiento del sistema
 */

require('dotenv').config();

const isProd = process.env.PRO === 'true';

/**
 * @typedef {Object} Config
 * @property {boolean} isProd - Indica si el entorno es producción
 * @property {string} nodeEnv - Entorno de Node.js (development/production)
 * @property {number} port - Puerto del servidor
 * @property {string} host - Host del servidor
 * @property {string} mongodbUri - URI de conexión a MongoDB
 * @property {string} jwtSecret - Secreto para tokens JWT principales
 * @property {string} jwtRefreshSecret - Secreto para refresh tokens JWT
 * @property {string} apiUrl - URL base del API
 * @property {string} frontendUrl - URL del frontend para CORS
 * @property {string} uploadPath - Ruta para almacenar archivos subidos
 * @property {number} maxFileSize - Tamaño máximo de archivo en bytes (5MB)
 */
const config = {
  isProd,
  nodeEnv: process.env.NODE_ENV || (isProd ? 'production' : 'development'),
  
  port: process.env.PORT || 4000,
  host: '0.0.0.0',
  
  mongodbUri: isProd 
    ? process.env.MONGODB_URI_PRO 
    : process.env.MONGODB_URI_DEV,
  
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  
  apiUrl: isProd 
    ? process.env.API_URL_PRO 
    : process.env.API_URL_DEV,
  
  frontendUrl: isProd 
    ? process.env.FRONTEND_URL_PRO 
    : process.env.FRONTEND_URL_DEV,
  
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 5242880,
};

/**
 * @function validateConfig
 * @description Valida que todas las variables de entorno requeridas estén presentes
 * @throws {Error} Termina el proceso si faltan variables requeridas
 * @returns {void}
 */
const validateConfig = () => {
  const required = [
    'mongodbUri',
    'jwtSecret',
    'jwtRefreshSecret'
  ];
  
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ ERROR: Faltan variables de entorno requeridas:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Asegúrate de tener un archivo .env con todas las variables necesarias.');
    process.exit(1);
  }
};

validateConfig();

if (!isProd) {
  console.log('\n📋 Configuración cargada:');
  console.log(`   Entorno: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   MongoDB: ${config.mongodbUri}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Frontend URL: ${config.frontendUrl}\n`);
}

module.exports = config;
