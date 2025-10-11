const mongoose = require('mongoose');
require('dotenv').config();

const { seed: seedCategories } = require('./seedCategories');
const { seed: seedLevelTemplates } = require('./seedLevelTemplates');

async function seedAll() {
  try {
    console.log('🌱 Iniciando seed completo del sistema...\n');

    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/duochallenge');
    console.log('✅ Conectado a MongoDB\n');

    // Seed de categorías
    console.log('📁 Paso 1: Creando categorías...');
    await seedCategories();
    console.log('✅ Categorías creadas\n');

    // Seed de plantillas de nivel
    console.log('📋 Paso 2: Creando plantillas de nivel...');
    await seedLevelTemplates();
    console.log('✅ Plantillas creadas\n');

    console.log('🎉 ¡Seed completo finalizado exitosamente!');
    console.log('\n✅ Sistema listo para usar');
    console.log('👉 Puedes iniciar el backoffice y comenzar a gestionar el sistema\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed completo:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar
seedAll();
