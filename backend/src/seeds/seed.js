require('dotenv').config();
const mongoose = require('mongoose');
const { 
  User, 
  ChallengeTemplate, 
  Variable, 
  Prize, 
  PrizeTemplate
} = require('../models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de base de datos...\n');

    // Limpiar colecciones existentes
    console.log('🧹 Limpiando colecciones...');
    await User.deleteMany({});
    await Variable.deleteMany({});
    await Prize.deleteMany({});
    console.log('✅ Colecciones limpiadas\n');

    // ========================================
    // 1. CREAR USUARIOS
    // ========================================
    console.log('👤 Creando usuarios...');
    
    const admin = new User({
      name: 'Administrador',
      email: 'admin@demo.com',
      passwordHash: 'admin123', // Se hasheará automáticamente
      role: 'admin'
    });
    await admin.save();

    const player = new User({
      name: 'Mi Amor',
      email: 'player@demo.com',
      passwordHash: 'player123',
      role: 'player'
    });
    await player.save();

    console.log('✅ Usuarios creados:');
    console.log(`   - Admin: admin@demo.com / admin123`);
    console.log(`   - Player: player@demo.com / player123\n`);

    // ========================================
    // 2. CREAR VARIABLES
    // ========================================
    console.log('📝 Creando variables...');
    
    const variables = [
      {
        type: 'fecha',
        active: true,
      },
      {
        type: 'texto',
        active: true,
      },
      {
        type: 'foto',
        active: true,
      },
      {
        type: 'lugar',
        active: true,
      }
    ];

    await Variable.insertMany(variables);
    console.log(`✅ ${variables.length} variables creadas\n`);
    

    // ========================================
    // 4. CREAR PREMIOS
    // ========================================
    console.log('🏆 Creando premios...');
    
    const prizes = [
      {
        title: 'Cena Romántica 🍝',
        description: 'Una deliciosa cena hecha por mí con velas y música romántica',
        imagePath: null,
        weight: 3,
        active: true,
      },
      {
        title: 'Masaje Relajante 💆',
        description: 'Un masaje completo de 1 hora con aceites esenciales',
        imagePath: null,
        weight: 4,
        active: true,
      },
      {
        title: 'Día de Spa en Casa 🛁',
        description: 'Día completo de spa con baño de burbujas, mascarillas y mimos',
        imagePath: null,
        weight: 2,
        active: true,
      },
      {
        title: 'Picnic en el Parque 🧺',
        description: 'Picnic sorpresa en tu lugar favorito con toda tu comida preferida',
        imagePath: null,
        weight: 3,
        active: true,
      },
      {
        title: 'Noche de Películas 🎬',
        description: 'Maratón de tus películas favoritas con palomitas, dulces y abrazos',
        imagePath: null,
        weight: 5,
        active: true,
      },
      {
        title: 'Desayuno en la Cama ☕',
        description: 'Desayuno sorpresa preparado con amor y servido en la cama',
        imagePath: null,
        weight: 4,
        active: true,
      },
      {
        title: 'Escapada de Fin de Semana 🏖️',
        description: 'Viaje sorpresa de fin de semana a un lugar especial',
        imagePath: null,
        weight: 1,
        active: true,
      },
      {
        title: 'Clase de Cocina Juntos 👨‍🍳',
        description: 'Aprenderemos a cocinar tu plato favorito juntos',
        imagePath: null,
        weight: 3,
        active: true,
      },
      {
        title: 'Carta de Amor Personalizada 💌',
        description: 'Una hermosa carta escrita a mano expresando todo mi amor',
        imagePath: null,
        weight: 5,
        active: true,
      },
      {
        title: 'Sesión de Fotos 📸',
        description: 'Sesión de fotos profesional para capturar nuestros mejores momentos',
        imagePath: null,
        weight: 2,
        active: true,
      }
    ];

    await PrizeTemplate.insertMany(prizes);
    console.log(`✅ ${prizes.length} premios creados\n`);

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log('============================================');
    console.log('✨ Seed completado exitosamente');
    console.log('============================================');
    console.log('📊 Resumen:');
    console.log(`   - ${await User.countDocuments()} usuarios`);
    console.log(`   - ${await Variable.countDocuments()} variables`);
    console.log(`   - ${await PrizeTemplate.countDocuments()} premios`);
    console.log('============================================\n');
    console.log('🎮 Credenciales de acceso:');
    console.log('   Admin:  admin@demo.com / admin123');
    console.log('   Player: player@demo.com / player123');
    console.log('============================================\n');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
};

// Ejecutar seed
const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('✅ Proceso completado. Cerrando conexión...');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  run();
}

module.exports = { seedDatabase };