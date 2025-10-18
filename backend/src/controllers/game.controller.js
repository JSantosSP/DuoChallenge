const { User, Level, GameSet } = require('../models');
const { generateNewGameSet, checkGameSetCompletion, resetAndGenerateNewSet } = require('../services/gameset.service');
const { getUserPrize } = require('../services/prize.service');
const { verifyAnswer, verifyDateAnswer, verifyPuzzleAnswer } = require('../utils/hash.util');

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

    const gameSet = await GameSet.find({
      _id: user.currentSetId
    })
      .populate('levels')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: { levels: gameSet.levels }
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

    // No enviar salt ni answerHash al cliente
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
 * Verificar respuesta de un nivel
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

    // Verificar si ya está completado
    if (level.completed) {
      return res.status(400).json({
        success: false,
        message: 'Este nivel ya ha sido completado'
      });
    }

    // Verificar intentos
    if (level.currentAttempts >= level.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Has alcanzado el máximo de intentos',
        attemptsLeft: 0
      });
    }

    // Incrementar intentos
    level.currentAttempts += 1;

    // Verificar respuesta según el tipo de reto
    let isCorrect = false;
    
    switch (level?.tipoDato?.type) {
      case 'texto':
        // Para retos de texto: comparar texto normalizado (insensible a mayúsculas y espacios)
        isCorrect = verifyAnswer(answer, level?.valor["texto"]?.answerHash, level?.valor["texto"]?.salt);
        break;
      
      case 'fecha':
        // Para retos de fecha: normalizar a formato YYYY-MM-DD y comparar
        isCorrect = verifyDateAnswer(answer, level?.valor["fecha"]?.answerHash, level?.valor["fecha"]?.salt);
        break;

      case 'lugar':
        // Para retos de lugar: esta por definir lógica específica, ahora similar a texto
        isCorrect = verifyAnswer(answer, level?.valor["lugar"]?.answerHash, level?.valor["lugar"]?.salt);
        break;
      
      case 'foto':
        // Para retos de foto: verificar el orden del puzzle
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

      // Agregar a completados del usuario
      await User.findByIdAndUpdate(userId, {
        $addToSet: { completedLevels: level._id }
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

    const totalLevels = await Level.countDocuments({
      levelId: { $in: (await GameSet.findById(user.currentSetId)).levels }
    });

    const completedLevels = user.completedLevels.length;

    const progress = totalLevels > 0 
      ? Math.round((completedLevels / totalLevels) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        hasActiveGame: true,
        progress,
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
  verifyLevel,
  getPrize,
  resetGame,
  getProgress
};