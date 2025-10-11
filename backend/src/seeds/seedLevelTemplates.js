const mongoose = require('mongoose');
const { Category, LevelTemplate } = require('../models');
require('dotenv').config();

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

    // Obtener categorías
    const categories = await Category.find();
    if (categories.length === 0) {
      console.error('❌ No hay categorías. Ejecuta primero: node seedCategories.js');
      process.exit(1);
    }

    console.log(`📁 Encontradas ${categories.length} categorías`);
    console.log('');

    // Crear un mapa de categorías por nombre
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Limpiar plantillas existentes
    const deletedCount = await LevelTemplate.deleteMany({});
    console.log(`🗑️  ${deletedCount.deletedCount} plantilla(s) anterior(es) eliminada(s)`);
    console.log('');

    // Definir plantillas de nivel
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
    
    console.log('============================================');
    console.log(`✅ ${result.length} plantillas de nivel creadas`);
    console.log('============================================');
    console.log('');
    
    // Agrupar por categoría
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
    console.log('✅ Seed completado exitosamente');
    console.log('============================================');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • ${Object.keys(byCategory).length} categorías utilizadas`);
    console.log(`   • ${result.length} plantillas de nivel creadas`);
    console.log(`   • ${result.filter(t => t.difficulty === 'easy').length} plantillas fáciles`);
    console.log(`   • ${result.filter(t => t.difficulty === 'medium').length} plantillas medias`);
    console.log(`   • ${result.filter(t => t.difficulty === 'hard').length} plantillas difíciles`);
    console.log('');
    console.log('💡 El sistema está listo para generar niveles automáticamente');
    console.log('');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('============================================');
    console.error('❌ Error al crear plantillas:');
    console.error('============================================');
    console.error(error.message);
    console.error('');
    console.error('💡 Verifica que:');
    console.error('   1. Hayas ejecutado primero seedCategories.js');
    console.error('   2. MongoDB esté corriendo');
    console.error('   3. Tengas permisos de escritura');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar seed
console.log('');
console.log('============================================');
console.log('🌱 Iniciando seed de plantillas de nivel...');
console.log('============================================');
console.log('');

seed();
