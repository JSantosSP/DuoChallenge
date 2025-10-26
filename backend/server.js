/**
 * @fileoverview Servidor Principal del Backend
 * @description Punto de entrada de la aplicación, configura Express, middleware y rutas
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const config = require('./src/config/index');
const connectDB = require('./src/config/database');

const app = express();
const PORT = config.port;
const HOST = config.host;

/**
 * Conectar a MongoDB
 */
connectDB();

/**
 * Configuración de CORS
 * - Producción: solo permite el dominio del frontend configurado
 * - Desarrollo: permite cualquier origen
 */
app.use(cors({
  origin: config.isProd 
    ? config.frontendUrl 
    : '*',
  credentials: true
}));

/**
 * Middleware para parsear JSON y URL-encoded
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Servir archivos estáticos desde /uploads
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Middleware de logging de todas las peticiones
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

/**
 * @route GET /
 * @description Endpoint raíz que retorna información básica del API
 */
app.get('/', (req, res) => {
  console.log('✅ GET / - Request recibido');
  res.json({ 
    message: '🎮 DuoChallenge API - Running',
    version: '1.0.0',
    status: 'OK'
  });
});

/**
 * @route GET /health
 * @description Health check para monitoreo del servidor
 */
app.get('/health', (req, res) => {
  console.log('✅ GET /health - Request recibido');
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Importación de rutas
 */
const authRoutes = require('./src/routes/auth.routes');
const gameRoutes = require('./src/routes/game.routes');
const adminRoutes = require('./src/routes/admin.routes');
const userDataRoutes = require('./src/routes/userdata.routes');
const prizeRoutes = require('./src/routes/prize.routes');
const prizeTemplateRoutes = require('./src/routes/prizeTemplate.routes');
const shareRoutes = require('./src/routes/share.routes');
const categoryRoutes = require('./src/routes/category.routes');
const categoryGetRoutes = require('./src/routes/category.get.routes');

/**
 * Endpoint directo para subir imágenes (con autenticación)
 */
const { verifyToken } = require('./src/middlewares/auth.middleware');
const upload = require('./src/middlewares/upload.middleware');
app.post('/api/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${imagePath}`;

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        path: imagePath,
        fullUrl: fullUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Registro de rutas principales
 */
app.use('/auth', authRoutes);
app.use('/api', gameRoutes);
app.use('/api/game', gameRoutes);
app.use('/admin', adminRoutes);
app.use('/api/userdata', userDataRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/prize-templates', prizeTemplateRoutes);
app.use('/api/share', shareRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/api/categories', categoryGetRoutes);

/**
 * Middleware 404 - Ruta no encontrada
 */
app.use((req, res) => {
  console.log(`❌ 404 - Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

/**
 * Middleware de manejo de errores global
 */
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(!config.isProd && { stack: error.stack })
  });
});

/**
 * Iniciar servidor
 */
const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('============================================');
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Host: ${HOST}`);
  console.log('============================================');
  console.log('🌐 Accesible desde:');
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Local:    http://127.0.0.1:${PORT}`);
  
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   Red (${name}): http://${iface.address}:${PORT}`);
      }
    });
  });
  
  console.log('');
  console.log('============================================');
  console.log('📚 Rutas disponibles:');
  console.log(`   GET    /                    - Info del API`);
  console.log(`   GET    /health              - Health check`);
  console.log('');
  console.log('🔐 Autenticación:');
  console.log(`   POST   /auth/register       - Registrar usuario`);
  console.log(`   POST   /auth/login          - Login`);
  console.log(`   POST   /auth/refresh        - Refresh token`);
  console.log(`   GET    /auth/profile        - Obtener perfil`);
  console.log('');
  console.log('🎮 Juego:');
  console.log(`   POST   /api/generate        - Generar juego`);
  console.log(`   POST   /api/reset           - Reiniciar juego`);
  console.log(`   GET    /api/progress        - Ver progreso`);
  console.log(`   GET    /api/levels          - Obtener niveles`);
  console.log(`   GET    /api/challenge/:id   - Obtener reto`);
  console.log(`   POST   /api/challenge/:id/verify - Verificar respuesta`);
  console.log(`   GET    /api/prize           - Obtener premio`);
  console.log('');
  console.log('👑 Admin:');
  console.log(`   GET    /admin/templates     - Listar plantillas`);
  console.log(`   POST   /admin/templates     - Crear plantilla`);
  console.log(`   GET    /admin/variables     - Listar variables`);
  console.log(`   GET    /admin/prizes        - Listar premios`);
  console.log(`   GET    /admin/users         - Listar usuarios`);
  console.log(`   POST   /admin/upload        - Subir imagen`);
  console.log(`   GET    /admin/stats         - Estadísticas`);
  console.log('');
  console.log('============================================');
  console.log('✅ Servidor listo - Esperando conexiones...');
  console.log('============================================');
  console.log('');
});

/**
 * Manejo de errores del servidor
 */
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ ERROR: El puerto ${PORT} ya está en uso`);
    console.log('\n💡 Solución:');
    console.log(`   1. Ejecuta: netstat -ano | findstr :${PORT}`);
    console.log('   2. Anota el PID (último número)');
    console.log('   3. Ejecuta: taskkill /PID [número] /F\n');
  } else if (error.code === 'EACCES') {
    console.error(`❌ ERROR: No hay permisos para usar el puerto ${PORT}`);
    console.log('💡 Solución: Usa un puerto > 1024 o ejecuta como administrador\n');
  } else {
    console.error('❌ ERROR del servidor:', error);
  }
  process.exit(1);
});

/**
 * Manejo de señales de terminación
 */
process.on('SIGTERM', () => {
  console.log('\nSIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\nSIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
