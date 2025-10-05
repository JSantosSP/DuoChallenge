const { GameSet, User, Challenge, Level } = require('../models');
const { generateGameSeed } = require('../utils/seed.util');
const { generateLevels } = require('./level.service');
const { assignPrize } = require('./prize.service');

/**
 * Genera un nuevo set de juego completo
 */
const generateNewGameSet = async (userId) => {
  try {
    // Generar seed único
    const seed = generateGameSeed();

    // Desactivar el set anterior si existe
    await GameSet.updateMany(
      { userId, active: true },
      { active: false }
    );

    // Crear nuevo set
    const gameSet = new GameSet({
      userId,
      levels: [],
      seed,
      prizeId: null,
      completed: false,
      active: true
    });

    await gameSet.save();

    // Generar niveles
    const levels = await generateLevels(userId, gameSet._id, seed, 3);

    // Actualizar el set con los niveles
    gameSet.levels = levels.map(l => l._id);
    await gameSet.save();

    // Actualizar usuario
    await User.findByIdAndUpdate(userId, {
      currentSetId: gameSet._id,
      completedChallenges: [],
      completedLevels: [],
      currentPrizeId: null
    });

    return gameSet;
    
  } catch (error) {
    console.error('Error generando nuevo set de juego:', error);
    throw error;
  }
};

/**
 * Verifica si el set está completado y asigna premio
 */
const checkGameSetCompletion = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user.currentSetId) {
      return { completed: false };
    }

    const gameSet = await GameSet.findById(user.currentSetId).populate('levels');
    
    if (!gameSet) {
      return { completed: false };
    }

    // Verificar si todos los niveles están completados
    const allLevelsCompleted = gameSet.levels.every(level => level.completed);

    if (allLevelsCompleted && !gameSet.completed) {
      // Marcar set como completado
      gameSet.completed = true;
      gameSet.completedAt = new Date();
      
      // Asignar premio
      const prize = await assignPrize(userId, gameSet.seed);
      gameSet.prizeId = prize._id;
      
      await gameSet.save();

      // Incrementar contador de sets completados
      user.totalSetsCompleted += 1;
      await user.save();

      return {
        completed: true,
        prize,
        message: '¡Felicidades! Has completado todos los niveles'
      };
    }

    return { completed: false };
    
  } catch (error) {
    console.error('Error verificando completitud del set:', error);
    throw error;
  }
};

/**
 * Reinicia el progreso y genera nuevo set
 */
const resetAndGenerateNewSet = async (userId) => {
  try {
    // Desactivar set actual
    await GameSet.updateMany(
      { userId, active: true },
      { active: false }
    );

    // Eliminar retos y niveles antiguos activos
    const oldSets = await GameSet.find({ userId, active: false });
    const oldLevelIds = oldSets.flatMap(set => set.levels);
    
    await Challenge.deleteMany({ levelId: { $in: oldLevelIds } });
    await Level.deleteMany({ _id: { $in: oldLevelIds } });

    // Generar nuevo set
    const newSet = await generateNewGameSet(userId);

    return {
      success: true,
      gameSet: newSet,
      message: 'Nuevo set de juego generado'
    };
    
  } catch (error) {
    console.error('Error reiniciando y generando nuevo set:', error);
    throw error;
  }
};

module.exports = {
  generateNewGameSet,
  checkGameSetCompletion,
  resetAndGenerateNewSet
};