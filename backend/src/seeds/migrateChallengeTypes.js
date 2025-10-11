require('dotenv').config();
const mongoose = require('mongoose');
const { Challenge, ChallengeTemplate } = require('../models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Script de migración para actualizar los tipos de retos
 * De: date_guess, riddle, photo_puzzle, location, question
 * A: text, date, photo
 */
const migrateChallengeTypes = async () => {
  try {
    console.log('🔄 Iniciando migración de tipos de retos...\n');

    // Mapeo de tipos antiguos a nuevos
    const typeMapping = {
      'date_guess': 'date',
      'riddle': 'text',
      'photo_puzzle': 'photo',
      'location': 'text',
      'question': 'text'
    };

    // Migrar ChallengeTemplate
    console.log('📋 Migrando plantillas de retos (ChallengeTemplate)...');
    for (const [oldType, newType] of Object.entries(typeMapping)) {
      const result = await ChallengeTemplate.updateMany(
        { type: oldType },
        { $set: { type: newType } }
      );
      if (result.modifiedCount > 0) {
        console.log(`   ✓ ${oldType} → ${newType}: ${result.modifiedCount} plantilla(s) actualizada(s)`);
      }
    }

    // Migrar Challenge
    console.log('\n🎯 Migrando retos generados (Challenge)...');
    for (const [oldType, newType] of Object.entries(typeMapping)) {
      const result = await Challenge.updateMany(
        { type: oldType },
        { $set: { type: newType } }
      );
      if (result.modifiedCount > 0) {
        console.log(`   ✓ ${oldType} → ${newType}: ${result.modifiedCount} reto(s) actualizado(s)`);
      }
    }

    // Mostrar resumen
    console.log('\n============================================');
    console.log('✨ Migración completada exitosamente');
    console.log('============================================');
    console.log('📊 Resumen final:');
    
    const templateStats = await ChallengeTemplate.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const challengeStats = await Challenge.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📋 ChallengeTemplate:');
    templateStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} plantilla(s)`);
    });

    console.log('\n🎯 Challenge:');
    challengeStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} reto(s)`);
    });
    
    console.log('\n============================================\n');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  }
};

// Ejecutar migración
const run = async () => {
  try {
    await connectDB();
    await migrateChallengeTypes();
    console.log('✅ Proceso completado. Cerrando conexión...');
    await mongoose.connection.close();
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

module.exports = { migrateChallengeTypes };
