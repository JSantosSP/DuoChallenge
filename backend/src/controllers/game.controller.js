const { User, Challenge, Level, GameSet } = require('../models');
const { generateNewGameSet, checkGameSetCompletion, resetAndGenerateNewSet } = require('../services/gameset.service');
const { checkLevelCompletion } = require('../services/level.service');
const { getUserPrize } = require('../services/prize.service');
const { verifyAnswer } = require('../utils/hash.util');

/**
 * Generar nuevo set de juego
 */
const generateGame = async (req, res) => {
  try {
    const userId = req.user._id;

    const gameSet = await generateNewGameSet(userId);

    // Poblar para devolver al cliente
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
 * Obtener niveles del usuario
 */
const getLevels = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user.currentSetId) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo. Genera uno nuevo.'
      });
    }

    const levels = await Level.find({
      gameSetId: user.currentSetId
    })
      .populate('challenges')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: { levels }
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
 * Obtener un reto específico
 */
const getChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findOne({
      _id: challengeId,
      userId
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Reto no encontrado'
      });
    }

    // No enviar salt ni answerHash al cliente
    const challengeData = challenge.toObject();
    delete challengeData.salt;
    delete challengeData.answerHash;

    res.json({
      success: true,
      data: { challenge: challengeData }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reto',
      error: error.message
    });
  }
};

/**
 * Verificar respuesta de un reto
 */
const verifyChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: 'La respuesta es requerida'
      });
    }

    const challenge = await Challenge.findOne({
      _id: challengeId,
      userId
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Reto no encontrado'
      });
    }

    // Verificar si ya está completado
    if (challenge.completed) {
      return res.status(400).json({
        success: false,
        message: 'Este reto ya ha sido completado'
      });
    }

    // Verificar intentos
    if (challenge.currentAttempts >= challenge.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Has alcanzado el máximo de intentos',
        attemptsLeft: 0
      });
    }

    // Incrementar intentos
    challenge.currentAttempts += 1;

    // Verificar respuesta
    const isCorrect = verifyAnswer(answer, challenge.answerHash, challenge.salt);

    if (isCorrect) {
      challenge.completed = true;
      challenge.completedAt = new Date();
      await challenge.save();

      // Agregar a completados del usuario
      await User.findByIdAndUpdate(userId, {
        $addToSet: { completedChallenges: challenge._id }
      });

      // Verificar si el nivel se completó
      const levelCompleted = await checkLevelCompletion(challenge.levelId);

      if (levelCompleted) {
        // Agregar nivel a completados
        await User.findByIdAndUpdate(userId, {
          $addToSet: { completedLevels: challenge.levelId }
        });

        // Verificar si el set completo se terminó
        const gameSetResult = await checkGameSetCompletion(userId);

        if (gameSetResult.completed) {
          return res.json({
            success: true,
            correct: true,
            message: '¡Respuesta correcta!',
            levelCompleted: true,
            gameCompleted: true,
            prize: gameSetResult.prize
          });
        }

        return res.json({
          success: true,
          correct: true,
          message: '¡Respuesta correcta! Nivel completado',
          levelCompleted: true,
          gameCompleted: false
        });
      }

      return res.json({
        success: true,
        correct: true,
        message: '¡Respuesta correcta!',
        levelCompleted: false
      });

    } else {
      await challenge.save();

      const attemptsLeft = challenge.maxAttempts - challenge.currentAttempts;

      return res.json({
        success: true,
        correct: false,
        message: 'Respuesta incorrecta',
        attemptsLeft,
        hint: attemptsLeft > 0 && challenge.hints.length > 0 
          ? challenge.hints[Math.min(challenge.currentAttempts - 1, challenge.hints.length - 1)]
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
 * Obtener premio actual del usuario
 */
const getPrize = async (req, res) => {
  try {
    const userId = req.user._id;

    const prize = await getUserPrize(userId);

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
 * Reiniciar juego y generar nuevo set
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
 * Obtener progreso del usuario
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate('currentSetId')
      .populate('currentPrizeId');

    if (!user.currentSetId) {
      return res.json({
        success: true,
        data: {
          hasActiveGame: false,
          progress: 0
        }
      });
    }

    const totalChallenges = await Challenge.countDocuments({
      userId,
      levelId: { $in: (await GameSet.findById(user.currentSetId)).levels }
    });

    const completedChallenges = user.completedChallenges.length;

    const progress = totalChallenges > 0 
      ? Math.round((completedChallenges / totalChallenges) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        hasActiveGame: true,
        progress,
        totalChallenges,
        completedChallenges,
        completedLevels: user.completedLevels.length,
        totalSetsCompleted: user.totalSetsCompleted,
        currentPrize: user.currentPrizeId
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

module.exports = {
  generateGame,
  getLevels,
  getChallenge,
  verifyChallenge,
  getPrize,
  resetGame,
  getProgress
};