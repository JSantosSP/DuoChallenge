require('dotenv').config();
const mongoose = require('mongoose');
const { 
  User, 
  ChallengeTemplate, 
  Variable, 
  Prize 
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
    await ChallengeTemplate.deleteMany({});
    await Variable.deleteMany({});
    await Prize.deleteMany({});
    console.log('✅ Colecciones limpiadas\n');

    // ========================================
    // 1. CREAR USUARIOS
    // ========================================
    console.log('👤 Creando usuarios...');
    
    const admin = new User({
      name: 'Administrador',
      email: 'admin@duochallenge.com',
      passwordHash: 'admin123', // Se hasheará automáticamente
      role: 'admin'
    });
    await admin.save();

    const player = new User({
      name: 'Mi Amor',
      email: 'player@duochallenge.com',
      passwordHash: 'player123',
      role: 'player'
    });
    await player.save();

    console.log('✅ Usuarios creados:');
    console.log(`   - Admin: admin@duochallenge.com / admin123`);
    console.log(`   - Player: player@duochallenge.com / player123\n`);

    // ========================================
    // 2. CREAR VARIABLES
    // ========================================
    console.log('📝 Creando variables...');
    
    const variables = [
      {
        key: 'primera_cita',
        value: '2020-06-15',
        type: 'date',
        category: 'fechas',
        description: 'Fecha de nuestra primera cita'
      },
      {
        key: 'primer_beso',
        value: '2020-06-20',
        type: 'date',
        category: 'fechas',
        description: 'Fecha de nuestro primer beso'
      },
      {
        key: 'aniversario',
        value: '2020-07-01',
        type: 'date',
        category: 'fechas',
        description: 'Nuestro aniversario'
      },
      {
        key: 'lugar_favorito',
        value: 'La playa al atardecer',
        type: 'location',
        category: 'lugares',
        description: 'Nuestro lugar favorito'
      },
      {
        key: 'restaurante_primera_cita',
        value: 'Restaurante El Mar',
        type: 'location',
        category: 'lugares',
        description: 'Restaurante de nuestra primera cita'
      },
      {
        key: 'apodo_cariñoso',
        value: 'Mi cielo',
        type: 'text',
        category: 'personal',
        description: 'Tu apodo cariñoso favorito'
      },
      {
        key: 'cancion_favorita',
        value: 'Perfect',
        type: 'text',
        category: 'personal',
        description: 'Nuestra canción'
      },
      {
        key: 'pelicula_primera_cita',
        value: 'La La Land',
        type: 'text',
        category: 'personal',
        description: 'Primera película que vimos juntos'
      }
    ];

    await Variable.insertMany(variables);
    console.log(`✅ ${variables.length} variables creadas\n`);

    // ========================================
    // 3. CREAR PLANTILLAS DE RETOS
    // ========================================
    console.log('🧩 Creando plantillas de retos...');
    
    const templates = [
      {
        type: 'date',
        title: 'Primera Cita',
        questionTemplate: '¿Qué fecha fue {{primera_cita}}?',
        variables: ['primera_cita'],
        hintsTemplate: [
          'Fue en verano de 2020',
          'Fue un lunes',
          'Cenamos en {{restaurante_primera_cita}}'
        ],
        difficulty: 'easy',
        category: 'fechas'
      },
      {
        type: 'date',
        title: 'Primer Beso',
        questionTemplate: '¿En qué fecha nos dimos nuestro primer beso?',
        variables: ['primer_beso'],
        hintsTemplate: [
          'Fue días después de nuestra primera cita',
          'Estábamos en {{lugar_favorito}}',
          'Era tarde en la noche'
        ],
        difficulty: 'medium',
        category: 'fechas'
      },
      {
        type: 'date',
        title: 'Aniversario',
        questionTemplate: '¿Cuándo es nuestro aniversario?',
        variables: ['aniversario'],
        hintsTemplate: [
          'Fue en julio de 2020',
          'El mismo mes que empezamos a salir',
          'Es el día que decidimos estar juntos oficialmente'
        ],
        difficulty: 'easy',
        category: 'fechas'
      },
      {
        type: 'text',
        title: 'Lugar Especial',
        questionTemplate: '¿Cuál es nuestro lugar favorito para pasear?',
        variables: ['lugar_favorito'],
        hintsTemplate: [
          'Tiene arena',
          'Nos encanta ir al atardecer',
          'Se escucha el sonido de las olas'
        ],
        difficulty: 'easy',
        category: 'lugares'
      },
      {
        type: 'text',
        title: 'Primera Cena',
        questionTemplate: '¿En qué restaurante tuvimos nuestra primera cita?',
        variables: ['restaurante_primera_cita'],
        hintsTemplate: [
          'Está cerca del mar',
          'El nombre tiene que ver con agua',
          'Pedimos mariscos'
        ],
        difficulty: 'medium',
        category: 'lugares'
      },
      {
        type: 'text',
        title: 'Apodo Cariñoso',
        questionTemplate: '¿Cómo me gusta llamarte con cariño?',
        variables: ['apodo_cariñoso'],
        hintsTemplate: [
          'Es algo que está arriba',
          'Es azul durante el día',
          'Está relacionado con el clima'
        ],
        difficulty: 'easy',
        category: 'personal'
      },
      {
        type: 'text',
        title: 'Nuestra Canción',
        questionTemplate: '¿Cuál es nuestra canción especial?',
        variables: ['cancion_favorita'],
        hintsTemplate: [
          'Es de Ed Sheeran',
          'Habla sobre que algo es perfecto',
          'La bailamos en nuestra primera cita'
        ],
        difficulty: 'medium',
        category: 'personal'
      },
      {
        type: 'text',
        title: 'Primera Película',
        questionTemplate: '¿Cuál fue la primera película que vimos juntos?',
        variables: ['pelicula_primera_cita'],
        hintsTemplate: [
          'Es un musical romántico',
          'Tiene Emma Stone y Ryan Gosling',
          'Sucede en Los Ángeles'
        ],
        difficulty: 'medium',
        category: 'personal'
      }
    ];

    await ChallengeTemplate.insertMany(templates);
    console.log(`✅ ${templates.length} plantillas de retos creadas\n`);

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
        category: 'comida',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Masaje Relajante 💆',
        description: 'Un masaje completo de 1 hora con aceites esenciales',
        imagePath: null,
        weight: 4,
        category: 'relax',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Día de Spa en Casa 🛁',
        description: 'Día completo de spa con baño de burbujas, mascarillas y mimos',
        imagePath: null,
        weight: 2,
        category: 'relax',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Picnic en el Parque 🧺',
        description: 'Picnic sorpresa en tu lugar favorito con toda tu comida preferida',
        imagePath: null,
        weight: 3,
        category: 'salida',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Noche de Películas 🎬',
        description: 'Maratón de tus películas favoritas con palomitas, dulces y abrazos',
        imagePath: null,
        weight: 5,
        category: 'hogar',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Desayuno en la Cama ☕',
        description: 'Desayuno sorpresa preparado con amor y servido en la cama',
        imagePath: null,
        weight: 4,
        category: 'comida',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Escapada de Fin de Semana 🏖️',
        description: 'Viaje sorpresa de fin de semana a un lugar especial',
        imagePath: null,
        weight: 1,
        category: 'viaje',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Clase de Cocina Juntos 👨‍🍳',
        description: 'Aprenderemos a cocinar tu plato favorito juntos',
        imagePath: null,
        weight: 3,
        category: 'actividad',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Carta de Amor Personalizada 💌',
        description: 'Una hermosa carta escrita a mano expresando todo mi amor',
        imagePath: null,
        weight: 5,
        category: 'romántico',
        isDefault: true, 
        userId: null
      },
      {
        title: 'Sesión de Fotos 📸',
        description: 'Sesión de fotos profesional para capturar nuestros mejores momentos',
        imagePath: null,
        weight: 2,
        category: 'actividad',
        isDefault: true, 
        userId: null
      }
    ];

    await Prize.insertMany(prizes);
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
    console.log(`   - ${await ChallengeTemplate.countDocuments()} plantillas de retos`);
    console.log(`   - ${await Prize.countDocuments()} premios`);
    console.log('============================================\n');
    console.log('🎮 Credenciales de acceso:');
    console.log('   Admin:  admin@duochallenge.com / admin123');
    console.log('   Player: player@duochallenge.com / player123');
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