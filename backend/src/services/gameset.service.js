/**
 * @fileoverview Servicio de GameSet
 * @description Gestiona la lógica de negocio para sets de juego: generación, completitud y reinicio
 */

const { GameSet, User, Challenge, Level } = require('../models');
const { generateGameSeed, seededRandom } = require('../utils/seed.util');
const { generateLevels } = require('../services/level.service');
const { assignPrize } = require('../services/prize.service');

/**
 * @function generateNewGameSet
 * @async
 * @description Genera un nuevo set de juego con niveles aleatorios basados en una semilla
 * @param {string} creatorId - ID del usuario creador de los datos
 * @param {string} playerId - ID del usuario que jugará (puede ser el mismo que creatorId)
 * @param {string|null} shareId - ID del GameShare si proviene de código compartido
 * @param {string|null} shareCode - Código compartido usado
 * @returns {Promise<GameSet>} Set de juego generado con niveles
 * @throws {Error} Si no se puede generar el set
 */
const generateNewGameSet = async (creatorId, playerId = null, shareId = null, shareCode = null) => {
  try {
    const seed = generateGameSeed();
    const targetUserId = playerId || creatorId;

    const gameSet = new GameSet({
      userId: targetUserId,
      creatorId: creatorId,
      shareId: shareId,
      shareCode: shareCode,
      levels: [],
      seed,
      prizeId: null,
      status: 'active',
      startedAt: new Date(),
      completedLevels: [],
      totalLevels: 0,
      progress: 0,
      active: true
    });

    await gameSet.save();

    const nlevels = Math.max(1, Math.floor(seededRandom(seed, 0) * 5) + 1);
    const levels = await generateLevels(creatorId, gameSet._id, seed, nlevels);

    gameSet.levels = levels.map(l => l._id);
    gameSet.totalLevels = levels.length;
    await gameSet.save();

    return gameSet;
    
  } catch (error) {
    console.error('Error generando nuevo set de juego:', error);
    throw error;
  }
};

/**
 * @function checkGameSetCompletion
 * @async
 * @description Verifica si un set de juego está completado y asigna premio si es necesario
 * @param {string} gameSetId - ID del set de juego
 * @returns {Promise<{completed: boolean, prize?: Object, message?: string}>} Estado de completitud
 * @throws {Error} Si no se puede verificar el set
 */
const checkGameSetCompletion = async (gameSetId) => {
  try {
    const gameSet = await GameSet.findById(gameSetId).populate('levels');
    
    if (!gameSet) {
      return { completed: false };
    }

    const allLevelsCompleted = gameSet.levels.every(level => level.completed);

    if (allLevelsCompleted && gameSet.status !== 'completed') {
      gameSet.status = 'completed';
      gameSet.completedAt = new Date();
      gameSet.progress = 100;
      gameSet.active = false;
      
      const prize = await assignPrize(gameSet.creatorId, gameSet.seed);
      gameSet.prizeId = prize._id;
      
      await gameSet.save();

      const user = await User.findById(gameSet.userId);
      if (user) {
        user.totalSetsCompleted += 1;
        await user.save();
      }

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
 * @function resetAndGenerateNewSet
 * @async
 * @description Abandona todos los sets activos del usuario y genera uno nuevo
 * @param {string} userId - ID del usuario
 * @returns {Promise<{success: boolean, gameSet: GameSet, message: string}>} Nuevo set generado
 * @throws {Error} Si no se puede reiniciar
 */
const resetAndGenerateNewSet = async (userId) => {
  try {
    await GameSet.updateMany(
      { userId, active: true },
      { $set: { active: false, status: 'abandoned' } }
    );

    const newSet = await generateNewGameSet(userId, userId, null, null);

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

/**
 * @function updateGameSetProgress
 * @async
 * @description Actualiza el porcentaje de progreso de un set de juego
 * @param {string} gameSetId - ID del set de juego
 * @returns {Promise<GameSet|null>} Set actualizado o null si no existe
 * @throws {Error} Si no se puede actualizar
 */
const updateGameSetProgress = async (gameSetId) => {
  try {
    const gameSet = await GameSet.findById(gameSetId);
    
    if (!gameSet) {
      return null;
    }

    const completedCount = gameSet.completedLevels.length;
    const totalCount = gameSet.totalLevels;
    
    gameSet.progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    await gameSet.save();

    return gameSet;
  } catch (error) {
    console.error('Error actualizando progreso:', error);
    throw error;
  }
};

module.exports = {
  generateNewGameSet,
  checkGameSetCompletion,
  resetAndGenerateNewSet,
  updateGameSetProgress
};
