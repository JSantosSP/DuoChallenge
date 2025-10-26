const { GameSet, User, Challenge, Level } = require('../models');
const { generateGameSeed, seededRandom } = require('../utils/seed.util');
const { generateLevels } = require('../services/level.service');
const { assignPrize } = require('../services/prize.service');

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