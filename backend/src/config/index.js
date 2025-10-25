require('dotenv').config();



const isProd = process.env.PRO === 'true';

const config = {
  // Estado del entorno
  isProd,
  nodeEnv: process.env.NODE_ENV || (isProd ? 'production' : 'development'),
  
  // Configuración del servidor
  port: process.env.PORT || 4000,
  host: '0.0.0.0',
  
  // Base de datos
  mongodbUri: isProd 
    ? process.env.MONGODB_URI_PRO 
    : process.env.MONGODB_URI_DEV,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  
  // URLs
  apiUrl: isProd 
    ? process.env.API_URL_PRO 
    : process.env.API_URL_DEV,
  
  frontendUrl: isProd 
    ? process.env.FRONTEND_URL_PRO 
    : process.env.FRONTEND_URL_DEV,
  
  // Uploads
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB por defecto
};

// Validar configuración crítica al inicio
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

// Validar al cargar el módulo
validateConfig();

// Log de configuración (solo en desarrollo)
if (!isProd) {
  console.log('\n📋 Configuración cargada:');
  console.log(`   Entorno: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   MongoDB: ${config.mongodbUri}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Frontend URL: ${config.frontendUrl}\n`);
}

module.exports = config;

