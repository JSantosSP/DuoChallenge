require('dotenv').config();
const mongoose = require('mongoose');
const { 
  User, 
  ChallengeTemplate, 
  Variable, 
  Prize, 
  PrizeTemplate,
  Category,
  GameSet,
  GameShare,
  Level,
  UserData
} = require('../models');
const {seed: seedCategories} = require('./seedCategories');

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
    await Category.deleteMany({});
    await GameSet.deleteMany({});
    await GameShare.deleteMany({});
    await Level.deleteMany({});
    await UserData.deleteMany({});
    await PrizeTemplate.deleteMany({});
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
      passwordHash: 'Player123',
      role: 'player'
    });
    await player.save();
    const player2 = new User({
      name: 'Mi Amor2',
      email: 'player2@demo.com',
      passwordHash: 'Player123',
      role: 'player'
    });
    await player2.save();

    console.log('✅ Usuarios creados:');
    console.log(`   - Admin: admin@demo.com / admin123`);
    console.log(`   - Player: player@demo.com / player123`);
    console.log(`   - Player: player2@demo.com / player123\n`);

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

    await seedCategories();

    // ========================================
    // 5. CREAR USERDATA DE PRUEBA
    // ========================================
    console.log('📊 Creando UserData de prueba...');
    
    // Obtener IDs necesarios
    const fechaVar = await Variable.findOne({ type: 'fecha' });
    const textoVar = await Variable.findOne({ type: 'texto' });
    const fotoVar = await Variable.findOne({ type: 'foto' });
    const lugarVar = await Variable.findOne({ type: 'lugar' });
    
    const categoriaPersonal = await Category.findOne({ name: 'Datos Personales' });
    const categoriaComida = await Category.findOne({ name: 'Comida y Bebidas' });
    const categoriaLugares = await Category.findOne({ name: 'Lugares Memorables' });

    const userDataItems = [
      {
        userId: player._id,
        categorias: categoriaPersonal._id,
        tipoDato: fechaVar._id,
        pregunta: '¿Cuál es mi fecha de nacimiento?',
        valor: '1990-05-15',
        pistas: ['Es en mayo', 'Año 1990'],
        difficulty: 'easy',
        active: true
      },
      {
        userId: player._id,
        categorias: categoriaComida._id,
        tipoDato: textoVar._id,
        pregunta: '¿Cuál es mi comida favorita?',
        valor: 'Pizza',
        pistas: ['Es italiana', 'Tiene queso'],
        difficulty: 'medium',
        active: true
      },
      {
        userId: player._id,
        categorias: categoriaLugares._id,
        tipoDato: lugarVar._id,
        pregunta: '¿Cuál es mi lugar favorito para vacacionar?',
        valor: 'Playa',
        pistas: ['Tiene arena', 'Tiene mar'],
        difficulty: 'easy',
        active: true
      },
      {
        userId: player._id,
        categorias: categoriaPersonal._id,
        tipoDato: textoVar._id,
        pregunta: '¿Cuál es mi color favorito?',
        valor: 'Azul',
        pistas: ['Es un color frío', 'Como el cielo'],
        difficulty: 'easy',
        active: true
      },
      {
        userId: player._id,
        categorias: categoriaComida._id,
        tipoDato: textoVar._id,
        pregunta: '¿Cuál es mi postre favorito?',
        valor: 'Helado',
        pistas: ['Es frío', 'Viene en sabores'],
        difficulty: 'medium',
        active: true
      }
    ];

    await UserData.insertMany(userDataItems);
    console.log(`✅ ${userDataItems.length} UserData creados para player@demo.com\n`);

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
    console.log(`   - ${await UserData.countDocuments()} UserData`);
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