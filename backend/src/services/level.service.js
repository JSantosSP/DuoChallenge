const { Level } = require('../models');
const { generateChallengesFromTemplates } = require('./challenge.service');

/**
 * Genera niveles con sus retos
 */
const generateLevels = async (userId, gameSetId, seed, levelCount = 3) => {
  try {
    const levels = [];
    const levelTitles = [
      'Recuerdos Inolvidables',
      'Momentos Especiales',
      'Nuestros Secretos',
      'El Camino Juntos',
      'Amor Verdadero'
    ];

    for (let i = 0; i < levelCount; i++) {
      // Crear nivel
      const level = new Level({
        title: levelTitles[i] || `Nivel ${i + 1}`,
        description: `Completa estos retos para avanzar`,
        order: i + 1,
        challenges: [],
        userId,
        gameSetId,
        completed: false
      });

      await level.save();

      // Generar retos para este nivel
      const challenges = await generateChallengesFromTemplates(
        userId,
        level._id,
        seed + i.toString(),
        3 // 3 retos por nivel
      );

      // Actualizar nivel con los IDs de los retos
      level.challenges = challenges.map(c => c._id);
      await level.save();

      levels.push(level);
    }

    return levels;
    
  } catch (error) {
    console.error('Error generando niveles:', error);
    throw error;
  }
};

/**
 * Verifica si un nivel está completado
 */
const checkLevelCompletion = async (levelId) => {
  try {
    const level = await Level.findById(levelId).populate('challenges');
    
    if (!level) {
      throw new Error('Nivel no encontrado');
    }

    const allCompleted = level.challenges.every(c => c.completed);
    
    if (allCompleted && !level.completed) {
      level.completed = true;
      level.completedAt = new Date();
      await level.save();
    }

    return level.completed;
    
  } catch (error) {
    console.error('Error verificando nivel:', error);
    throw error;
  }
};

module.exports = {
  generateLevels,
  checkLevelCompletion
};
