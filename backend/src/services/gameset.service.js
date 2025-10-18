const { GameSet, User, Challenge, Level, GameInstance } = require('../models');
const { generateGameSeed } = require('../utils/seed.util');
const { generateLevels } = require('../services/level.service');
const { assignPrize } = require('../services/prize.service');

/**
 * Genera un nuevo set de juego completo
 */
const generateNewGameSet = async (creatorId, gameInstanceId = null) => {
  try {
    // Generar seed único
    const seed = generateGameSeed();

    // Si hay instancia, usamos el playerId de la instancia
    let targetUserId = creatorId;
    if (gameInstanceId) {
      const instance = await GameInstance.findById(gameInstanceId);
      if (instance) {
        targetUserId = instance.playerId;
      }
    }

    // Desactivar el set anterior
    if (gameInstanceId) {
      await GameSet.updateMany(
        { gameInstanceId, active: true },
        { active: false }
      );
    } else {
      await GameSet.updateMany(
        { userId: targetUserId, active: true, gameInstanceId: null },
        { active: false }
      );
    }

    // Crear nuevo set
    const gameSet = new GameSet({
      userId: targetUserId,
      gameInstanceId: gameInstanceId || null,
      levels: [],
      seed,
      prizeId: null,
      completed: false,
      active: true
    });

    await gameSet.save();

    const nlevels = seededRandom(seed, 0) * 5;
    // Generar niveles usando los datos del CREADOR
    const levels = await generateLevels(creatorId, gameSet._id, seed, nlevels);

    // Actualizar el set con los niveles
    gameSet.levels = levels.map(l => l._id);
    await gameSet.save();

    // Actualizar usuario o instancia
    if (gameInstanceId) {
      await GameInstance.findByIdAndUpdate(gameInstanceId, {
        currentSetId: gameSet._id,
        completedChallenges: [],
        completedLevels: [],
        currentPrizeId: null
      });
    } else {
      await User.findByIdAndUpdate(targetUserId, {
        currentSetId: gameSet._id,
        completedChallenges: [],
        completedLevels: [],
        currentPrizeId: null
      });
    }

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