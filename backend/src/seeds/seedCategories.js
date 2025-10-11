require('dotenv').config();
const mongoose = require('mongoose');
const { Category } = require('../models');

const categories = [
  {
    name: 'Fechas Especiales',
    description: 'Fechas importantes y memorables en la relación: aniversarios, cumpleaños, primera cita, etc.',
    active: true
  },
  {
    name: 'Lugares Memorables',
    description: 'Lugares significativos visitados juntos: primer beso, viajes, restaurantes favoritos, etc.',
    active: true
  },
  {
    name: 'Personas Importantes',
    description: 'Familiares, amigos y personas especiales en sus vidas',
    active: true
  },
  {
    name: 'Fotos y Recuerdos',
    description: 'Fotografías especiales y momentos capturados en imágenes',
    active: true
  },
  {
    name: 'Datos Personales',
    description: 'Información personal, gustos, preferencias y detalles íntimos',
    active: true
  },
  {
    name: 'Música y Entretenimiento',
    description: 'Canciones favoritas, películas, series, libros y entretenimiento compartido',
    active: true
  },
  {
    name: 'Comida y Bebidas',
    description: 'Restaurantes favoritos, platos especiales, bebidas preferidas',
    active: true
  },
  {
    name: 'Mascotas y Animales',
    description: 'Mascotas, nombres de animales, fechas importantes relacionadas',
    active: true
  }
];

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

async function seedCategories() {
  try {
    console.log('🌱 Iniciando seed de categorías...\n');

    // Limpiar categorías existentes
    console.log('🧹 Limpiando categorías...');
    const deletedCount = await Category.deleteMany({});
    console.log(`   🗑️  ${deletedCount.deletedCount} categoría(s) eliminada(s)\n`);

    // Insertar nuevas categorías
    console.log('📁 Creando categorías...');
    const result = await Category.insertMany(categories);
    console.log(`✅ ${result.length} categorías creadas\n`);
    
    // Mostrar categorías creadas
    console.log('📋 Categorías creadas:');
    result.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name}`);
      console.log(`      📝 ${cat.description}`);
      console.log(`      🆔 ID: ${cat._id}`);
      console.log('');
    });

    console.log('============================================');
    console.log('✅ Seed de categorías completado');
    console.log('============================================\n');

  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
    throw error;
  }
};

// Ejecutar seed
const run = async () => {
  try {
    console.log('');
    console.log('============================================');
    console.log('🌱 SEED DE CATEGORÍAS');
    console.log('============================================');
    console.log('');

    await connectDB();
    await seedCategories();
    
    console.log('💡 Próximos pasos:');
    console.log('   1. Ejecuta: node src/seeds/seedLevelTemplates.js');
    console.log('   2. O ejecuta todo: node src/seeds/seedAll.js');
    console.log('');
    
    await mongoose.connection.close();
    console.log('✅ Proceso completado. Cerrando conexión...\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  run();
}

module.exports = { seed: seedCategories };