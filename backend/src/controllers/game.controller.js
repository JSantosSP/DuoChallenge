/**
 * @fileoverview Controlador de Juego
 * @description Gestiona la lógica principal del juego: generación de sets, niveles, verificación de respuestas y progreso
 */

const { User, Level, GameSet } = require('../models');
const { generateNewGameSet, checkGameSetCompletion, resetAndGenerateNewSet } = require('../services/gameset.service');
const { getUserPrize } = require('../services/prize.service');
const { verifyAnswer, verifyDateAnswer, verifyPuzzleAnswer } = require('../utils/hash.util');

/**
 * @function generateGame
 * @async
 * @description Genera un nuevo set de juego para el usuario autenticado
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Set de juego generado con niveles
 * @returns {Object} 500 - Error al generar el juego
 */
const generateGame = async (req, res) => {
  try {
    const userId = req.user._id;

    const gameSet = await generateNewGameSet(userId, userId, null, null);

    await gameSet.populate('levels');

    res.json({
      success: true,
      message: 'Set de juego generado exitosamente',
      data: { gameSet }
    });

  } catch (error) {
    console.error('Error generando juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar juego',
      error: error.message
    });
  }
};

/**
 * @function getLevels
 * @async
 * @description Obtiene todos los niveles de un set de juego específico
 * @param {string} req.params.gameSetId - ID del set de juego
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de niveles y datos del set
 * @returns {Object} 404 - Juego no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const getLevels = async (req, res) => {
  try {
    const { gameSetId } = req.params;
    const userId = req.user._id;

    const gameSet = await GameSet.findOne({
      _id: gameSetId,
      userId: userId
    }).populate({
      path: 'levels',
      options: { sort: { order: 1 } },
      populate: { path: 'tipoDato' }
    });

    if (!gameSet) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
    }

    res.json({
      success: true,
      data: { 
        levels: gameSet.levels,
        gameSet: {
          _id: gameSet._id,
          status: gameSet.status,
          progress: gameSet.progress,
          totalLevels: gameSet.totalLevels
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo niveles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener niveles',
      error: error.message
    });
  }
};

/**
 * @function getLevel
 * @async
 * @description Obtiene los detalles de un nivel específico (sin datos sensibles)
 * @param {string} req.params.LevelId - ID del nivel
 * @returns {Object} 200 - Datos del nivel (sin hash ni salt)
 * @returns {Object} 404 - Nivel no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const getLevel = async (req, res) => {
  try {
    const { LevelId } = req.params;

    const level = await Level.findOne({
      _id: LevelId
    });

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Nivel no encontrado'
      });
    }

    const levelData = level.toObject();
    delete levelData.salt;
    delete levelData.answerHash;

    res.json({
      success: true,
      data: { level: levelData }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener nivel',
      error: error.message
    });
  }
};

/**
 * @function verifyLevel
 * @async
 * @description Verifica la respuesta de un nivel y actualiza el progreso
 * @param {string} req.params.levelId - ID del nivel
 * @param {Object} req.body - Respuesta del usuario
 * @param {string} [req.body.answer] - Respuesta de texto/fecha/lugar
 * @param {Array<number>} [req.body.puzzleOrder] - Orden de piezas del puzzle
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Resultado de la verificación (correcto/incorrecto)
 * @returns {Object} 400 - Respuesta no proporcionada o nivel ya completado
 * @returns {Object} 404 - Nivel no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const verifyLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { answer, puzzleOrder } = req.body;
    const userId = req.user._id;

    if (!answer && !puzzleOrder) {
      return res.status(400).json({
        success: false,
        message: 'La respuesta es requerida'
      });
    }

    const level = await Level.findOne({
      _id: levelId,
    }).populate('tipoDato');

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Nivel no encontrado'
      });
    }

    if (level.completed) {
      return res.status(400).json({
        success: false,
        message: 'Este nivel ya ha sido completado'
      });
    }

    if (level.currentAttempts >= level.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Has alcanzado el máximo de intentos',
        attemptsLeft: 0
      });
    }

    level.currentAttempts += 1;

    let isCorrect = false;
    
    switch (level?.tipoDato?.type) {
      case 'texto':
        isCorrect = verifyAnswer(answer, level?.valor["texto"]?.answerHash, level?.valor["texto"]?.salt);
        break;
      
      case 'fecha':
        isCorrect = verifyDateAnswer(answer, level?.valor["fecha"]?.answerHash, level?.valor["fecha"]?.salt);
        break;

      case 'lugar':
        isCorrect = verifyAnswer(answer, level?.valor["lugar"]?.answerHash, level?.valor["lugar"]?.salt);
        break;
      
      case 'foto':
        if (!puzzleOrder || !Array.isArray(puzzleOrder)) {
          return res.status(400).json({
            success: false,
            message: 'Orden del puzzle inválido'
          });
        }
        isCorrect = verifyPuzzleAnswer(puzzleOrder, level?.valor["foto"]?.answerHash, level?.valor["foto"]?.salt);
        break;
      
      default:
        isCorrect = false;
    }

    if (isCorrect) {
      level.completed = true;
      level.completedAt = new Date();
      await level.save();

      const gameSet = await GameSet.findById(level.gameSetId);
      if (gameSet) {
        gameSet.completedLevels.push(level._id);
        gameSet.progress = Math.round((gameSet.completedLevels.length / gameSet.totalLevels) * 100);
        await gameSet.save();

        const gameSetResult = await checkGameSetCompletion(gameSet._id);

        if (gameSetResult.completed) {
          return res.json({
            success: true,
            correct: true,
            message: '¡Respuesta correcta!',
            levelCompleted: true,
            gameCompleted: true,
            prize: gameSetResult.prize,
            progress: 100
          });
        }

        return res.json({
          success: true,
          correct: true,
          message: '¡Respuesta correcta! Nivel completado',
          levelCompleted: true,
          gameCompleted: false,
          progress: gameSet.progress
        });
      }

    } else {
      await level.save();

      const attemptsLeft = level.maxAttempts - level.currentAttempts;

      return res.json({
        success: true,
        correct: false,
        message: 'Respuesta incorrecta',
        attemptsLeft,
        hint: attemptsLeft > 0 && level.pistas.length > 0 
          ? level.pistas[Math.min(level.currentAttempts - 1, level.pistas.length - 1)]
          : null
      });
    }

  } catch (error) {
    console.error('Error verificando reto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar respuesta',
      error: error.message
    });
  }
};

/**
 * @function getPrize
 * @async
 * @description Obtiene el premio de un set completado o del usuario
 * @param {Object} req.user - Usuario autenticado
 * @param {string} [req.query.gameSetId] - ID del set (opcional)
 * @returns {Object} 200 - Datos del premio
 * @returns {Object} 404 - Premio no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const getPrize = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameSetId } = req.query;

    let prize;

    if (gameSetId) {
      const gameSet = await GameSet.findOne({
        _id: gameSetId,
        userId: userId
      }).populate('prizeId');

      if (!gameSet) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado'
        });
      }

      if (gameSet.status !== 'completed' || !gameSet.prizeId) {
        return res.status(404).json({
          success: false,
          message: 'Este juego no tiene premio asignado aún'
        });
      }

      prize = gameSet.prizeId;
    } else {
      prize = await getUserPrize(userId);
    }

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: 'No tienes premio asignado aún. ¡Completa todos los niveles!'
      });
    }

    res.json({
      success: true,
      data: { prize }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener premio',
      error: error.message
    });
  }
};

/**
 * @function resetGame
 * @async
 * @description Reinicia todos los juegos activos y genera un nuevo set
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Nuevo set generado
 * @returns {Object} 500 - Error del servidor
 */
const resetGame = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await resetAndGenerateNewSet(userId);

    res.json({
      success: true,
      message: result.message,
      data: { gameSet: result.gameSet }
    });

  } catch (error) {
    console.error('Error reiniciando juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reiniciar juego',
      error: error.message
    });
  }
};

/**
 * @function getProgress
 * @async
 * @description Obtiene el progreso de un set de juego específico
 * @param {string} req.params.gameSetId - ID del set de juego
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Datos de progreso del set
 * @returns {Object} 404 - Juego no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const getProgress = async (req, res) => {
  try {
    const { gameSetId } = req.params;
    const userId = req.user._id;

    const gameSet = await GameSet.findOne({
      _id: gameSetId,
      userId: userId
    }).populate('prizeId');

    if (!gameSet) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        gameSetId: gameSet._id,
        status: gameSet.status,
        progress: gameSet.progress,
        completedLevels: gameSet.completedLevels.length,
        totalLevels: gameSet.totalLevels,
        prize: gameSet.prizeId,
        startedAt: gameSet.startedAt,
        completedAt: gameSet.completedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener progreso',
      error: error.message
    });
  }
};

/**
 * @function getHistory
 * @async
 * @description Obtiene el historial de juegos del usuario
 * @param {Object} req.user - Usuario autenticado
 * @param {string} [req.query.status] - Filtrar por estado (active/completed/abandoned)
 * @returns {Object} 200 - Lista de sets de juego
 * @returns {Object} 500 - Error del servidor
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const gameSets = await GameSet.find(filter)
      .populate('creatorId', 'name email')
      .populate('shareId')
      .populate('prizeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { 
        gameSets,
        total: gameSets.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

/**
 * @function getStats
 * @async
 * @description Obtiene estadísticas del usuario: juegos completados, progreso promedio, etc.
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Estadísticas del usuario
 * @returns {Object} 500 - Error del servidor
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalGames = await GameSet.countDocuments({ userId });
    const completedGames = await GameSet.countDocuments({ userId, status: 'completed' });
    const activeGames = await GameSet.countDocuments({ userId, status: 'active' });
    const abandonedGames = await GameSet.countDocuments({ userId, status: 'abandoned' });

    const allGames = await GameSet.find({ userId });
    const totalProgress = allGames.reduce((sum, game) => sum + (game.progress || 0), 0);
    const averageProgress = totalGames > 0 ? Math.round(totalProgress / totalGames) : 0;

    const totalLevelsCompleted = allGames.reduce((sum, game) => sum + game.completedLevels.length, 0);
    const totalLevelsAvailable = allGames.reduce((sum, game) => sum + game.totalLevels, 0);

    const gamesFromShares = await GameSet.countDocuments({ 
      userId, 
      shareId: { $ne: null } 
    });
    
    const ownGames = await GameSet.countDocuments({ 
      userId,
      $or: [
        { shareId: null },
        { shareId: { $exists: false } },
        { $expr: { $eq: ['$userId', '$creatorId'] } }
      ]
    });

    const prizesWon = await GameSet.countDocuments({ 
      userId, 
      status: 'completed', 
      prizeId: { $ne: null } 
    });

    res.json({
      success: true,
      data: {
        totalGames,
        completedGames,
        activeGames,
        abandonedGames,
        averageProgress,
        totalLevelsCompleted,
        totalLevelsAvailable,
        gamesFromShares,
        ownGames,
        prizesWon,
        completionRate: totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * @function getActiveGames
 * @async
 * @description Obtiene todos los juegos activos del usuario
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de juegos activos
 * @returns {Object} 500 - Error del servidor
 */
const getActiveGames = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeGames = await GameSet.find({
      userId,
      status: 'active'
    })
      .populate('creatorId', 'name email')
      .populate('shareId', 'code')
      .sort({ createdAt: -1 });

    const gamesWithShareCode = activeGames.map(game => {
      const gameObj = game.toObject();
      if (gameObj.shareId && gameObj.shareId.code) {
        gameObj.shareCode = gameObj.shareId.code;
      }
      return gameObj;
    });

    res.json({
      success: true,
      data: { 
        games: gamesWithShareCode,
        total: gamesWithShareCode.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo juegos activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener juegos activos',
      error: error.message
    });
  }
};

module.exports = {
  generateGame,
  getLevels,
  getLevel,
  verifyLevel,
  getPrize,
  resetGame,
  getProgress,
  getHistory,
  getStats,
  getActiveGames
};
