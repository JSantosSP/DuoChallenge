require('dotenv').config();
const mongoose = require('mongoose');
const { Category, LevelTemplate } = require('../models');

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

async function seedLevelTemplates() {
  try {
    console.log('🌱 Iniciando seed de plantillas de nivel...\n');

    // Obtener categorías
    console.log('📁 Buscando categorías...');
    const categories = await Category.find();
    if (categories.length === 0) {
      console.error('❌ No hay categorías en la base de datos');
      console.error('   Ejecuta primero: node src/seeds/seedCategories.js\n');
      throw new Error('No hay categorías disponibles');
    }
    console.log(`✅ Encontradas ${categories.length} categorías\n`);

    // Crear un mapa de categorías por nombre
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Limpiar plantillas existentes
    console.log('🧹 Limpiando plantillas...');
    const deletedCount = await LevelTemplate.deleteMany({});
    console.log(`   🗑️  ${deletedCount.deletedCount} plantilla(s) eliminada(s)\n`);

    // Definir plantillas de nivel
    console.log('📋 Creando plantillas de nivel...');
    const templates = [
      {
        name: 'Nivel de Aniversarios',
        description: 'Retos basados en fechas importantes de la relación',
        categoryId: categoryMap['Fechas Especiales'],
        dataType: 'fecha',
        challengesPerLevel: 3,
        difficulty: 'easy',
        order: 1,
        active: true
      },
      {
        name: 'Nivel de Lugares Románticos',
        description: 'Retos sobre lugares especiales visitados juntos',
        categoryId: categoryMap['Lugares Memorables'],
        dataType: 'lugar',
        challengesPerLevel: 4,
        difficulty: 'medium',
        order: 2,
        active: true
      },
      {
        name: 'Nivel de Fotos Memorables',
        description: 'Retos basados en fotografías especiales',
        categoryId: categoryMap['Fotos y Recuerdos'],
        dataType: 'foto',
        challengesPerLevel: 3,
        difficulty: 'medium',
        order: 3,
        active: true
      },
      {
        name: 'Nivel de Nombres Importantes',
        description: 'Retos sobre personas importantes en sus vidas',
        categoryId: categoryMap['Personas Importantes'],
        dataType: 'nombre',
        challengesPerLevel: 4,
        difficulty: 'easy',
        order: 4,
        active: true
      },
      {
        name: 'Nivel de Gustos Personales',
        description: 'Retos sobre gustos, preferencias y detalles personales',
        categoryId: categoryMap['Datos Personales'],
        dataType: 'texto',
        challengesPerLevel: 5,
        difficulty: 'hard',
        order: 5,
        active: true
      },
      {
        name: 'Nivel de Canciones Especiales',
        description: 'Retos sobre música y canciones favoritas',
        categoryId: categoryMap['Música y Entretenimiento'],
        dataType: 'texto',
        challengesPerLevel: 3,
        difficulty: 'medium',
        order: 6,
        active: true
      },
      {
        name: 'Nivel de Comida Favorita',
        description: 'Retos sobre restaurantes, platos y bebidas favoritas',
        categoryId: categoryMap['Comida y Bebidas'],
        dataType: 'texto',
        challengesPerLevel: 4,
        difficulty: 'easy',
        order: 7,
        active: true
      },
      {
        name: 'Nivel de Mascotas',
        description: 'Retos sobre mascotas y animales especiales',
        categoryId: categoryMap['Mascotas y Animales'],
        dataType: 'nombre',
        challengesPerLevel: 3,
        difficulty: 'easy',
        order: 8,
        active: true
      },
      {
        name: 'Nivel Avanzado de Fechas',
        description: 'Retos difíciles sobre fechas muy específicas',
        categoryId: categoryMap['Fechas Especiales'],
        dataType: 'fecha',
        challengesPerLevel: 5,
        difficulty: 'hard',
        order: 9,
        active: true
      },
      {
        name: 'Nivel de Números Especiales',
        description: 'Retos sobre números importantes (teléfonos, códigos, etc.)',
        categoryId: categoryMap['Datos Personales'],
        dataType: 'numero',
        challengesPerLevel: 4,
        difficulty: 'medium',
        order: 10,
        active: true
      }
    ];

    // Insertar plantillas
    const result = await LevelTemplate.insertMany(templates);
    console.log(`✅ ${result.length} plantillas creadas\n`);
    
    // Agrupar por categoría para mostrar
    const byCategory = {};
    for (const template of result) {
      await template.populate('categoryId', 'name');
      const catName = template.categoryId.name;
      if (!byCategory[catName]) {
        byCategory[catName] = [];
      }
      byCategory[catName].push(template);
    }

    // Mostrar plantillas creadas agrupadas por categoría
    console.log('📋 Plantillas creadas por categoría:');
    console.log('');
    
    Object.keys(byCategory).forEach(catName => {
      console.log(`📁 ${catName}:`);
      byCategory[catName].forEach(template => {
        console.log(`   ✓ ${template.name}`);
        console.log(`     • Tipo: ${template.dataType}`);
        console.log(`     • Retos: ${template.challengesPerLevel}`);
        console.log(`     • Dificultad: ${template.difficulty}`);
        console.log(`     • Orden: ${template.order}`);
        console.log('');
      });
    });

    console.log('============================================');
    console.log('✅ Seed de plantillas completado');
    console.log('============================================');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • ${Object.keys(byCategory).length} categorías utilizadas`);
    console.log(`   • ${result.length} plantillas de nivel creadas`);
    console.log(`   • ${result.filter(t => t.difficulty === 'easy').length} plantillas fáciles`);
    console.log(`   • ${result.filter(t => t.difficulty === 'medium').length} plantillas medias`);
    console.log(`   • ${result.filter(t => t.difficulty === 'hard').length} plantillas difíciles`);
    console.log('');

  } catch (error) {
    console.error('❌ Error al crear plantillas:', error);
    throw error;
  }
}

// Ejecutar seed
const run = async () => {
  try {
    console.log('');
    console.log('============================================');
    console.log('🌱 SEED DE PLANTILLAS DE NIVEL');
    console.log('============================================');
    console.log('');

    await connectDB();
    await seedLevelTemplates();
    
    console.log('💡 El sistema está listo para generar niveles automáticamente');
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

module.exports = { seed: seedLevelTemplates };