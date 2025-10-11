const mongoose = require('mongoose');
const { Category } = require('../models');
require('dotenv').config();

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

async function seed() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/duochallenge';
    await mongoose.connect(mongoUri);
    console.log('');
    console.log('============================================');
    console.log('📦 Conectado a MongoDB');
    console.log('============================================');
    console.log('');

    // Limpiar categorías existentes
    const deletedCount = await Category.deleteMany({});
    console.log(`🗑️  ${deletedCount.deletedCount} categoría(s) anterior(es) eliminada(s)`);
    console.log('');

    // Insertar nuevas categorías
    const result = await Category.insertMany(categories);
    console.log('============================================');
    console.log(`✅ ${result.length} categorías creadas exitosamente`);
    console.log('============================================');
    console.log('');
    
    // Mostrar categorías creadas
    console.log('📋 Categorías creadas:');
    result.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name}`);
      console.log(`      📝 ${cat.description}`);
      console.log(`      🆔 ID: ${cat._id}`);
      console.log('');
    });

    console.log('============================================');
    console.log('✅ Seed completado exitosamente');
    console.log('============================================');
    console.log('');
    console.log('💡 Próximos pasos:');
    console.log('   1. Inicia el servidor backend: npm run dev');
    console.log('   2. Inicia el backoffice: cd ../backoffice && npm run dev');
    console.log('   3. Accede a http://localhost:5173');
    console.log('   4. Crea plantillas de nivel usando estas categorías');
    console.log('');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('============================================');
    console.error('❌ Error al crear categorías:');
    console.error('============================================');
    console.error(error.message);
    console.error('');
    console.error('💡 Verifica que:');
    console.error('   1. MongoDB esté corriendo');
    console.error('   2. La URL de conexión sea correcta');
    console.error('   3. Tengas permisos de escritura');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar seed
console.log('');
console.log('============================================');
console.log('🌱 Iniciando seed de categorías...');
console.log('============================================');
console.log('');

seed();
