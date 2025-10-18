require('dotenv').config();
const mongoose = require('mongoose');

const { seed: seedCategories } = require('./seedCategories');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/duochallenge';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

async function seedAll() {
  try {
    console.log('🌱 Iniciando seed completo del sistema...\n');

    // Seed de categorías
    console.log('============================================');
    console.log('📁 PASO 1/2: Creando categorías');
    console.log('============================================\n');
    await seedCategories();

    // Seed de plantillas de nivel
    console.log('============================================');
    console.log('📋 PASO 2/2: Creando plantillas de nivel');
    console.log('============================================\n');

  } catch (error) {
    console.error('❌ Error en seed completo:', error);
    throw error;
  }
}

// Ejecutar seed
const run = async () => {
  try {
    console.log('');
    console.log('============================================');
    console.log('🌱 SEED COMPLETO DEL SISTEMA');
    console.log('============================================');
    console.log('');

    await connectDB();
    await seedAll();
    
    await mongoose.connection.close();
    console.log('✅ Proceso completado. Cerrando conexión...\n');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('============================================');
    console.error('❌ ERROR FATAL EN SEED');
    console.error('============================================');
    console.error(error.message);
    console.error('');
    console.error('💡 Verifica que:');
    console.error('   1. MongoDB esté corriendo');
    console.error('   2. La URL de conexión sea correcta en .env');
    console.error('   3. Tengas permisos de escritura');
    console.error('');
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  run();
}

module.exports = { seedAll };