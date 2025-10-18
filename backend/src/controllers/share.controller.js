const { GameShare, GameInstance, User, UserData } = require('../models');
const { generateNewGameSet } = require('../services/gameset.service');

// Generar código único de 6 caracteres
const generateShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Crear código de compartición
const createShareCode = async (req, res) => {
  try {
    const creatorId = req.user._id;
    
    // Verificar que el usuario tiene datos para compartir
    const userData = await UserData.find({ userId: creatorId, active: true });
    if (userData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes tener datos personalizados antes de compartir'
      });
    }

    // Desactivar códigos anteriores del usuario
    await GameShare.updateMany(
      { creatorId, active: true },
      { active: false }
    );

    // Generar código único
    let code;
    let exists = true;
    while (exists) {
      code = generateShareCode();
      exists = await GameShare.findOne({ code });
    }

    // Crear nuevo código
    const gameShare = new GameShare({
      creatorId,
      code,
      active: true
    });

    await gameShare.save();

    res.status(201).json({
      success: true,
      message: 'Código generado exitosamente',
      data: { gameShare }
    });
  } catch (error) {
    console.error('Error creando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar código',
      error: error.message
    });
  }
};

// Obtener códigos del usuario
const getUserShareCodes = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const shareCodes = await GameShare.find({ creatorId })
      .sort({ createdAt: -1 })
      .populate('usedBy.userId', 'name email');

    res.json({
      success: true,
      data: { shareCodes }
    });
  } catch (error) {
    console.error('Error obteniendo códigos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener códigos',
      error: error.message
    });
  }
};

// Verificar código y obtener info del creador
const verifyShareCode = async (req, res) => {
  try {
    const { code } = req.params;

    const gameShare = await GameShare.findOne({ code, active: true })
      .populate('creatorId', 'name email');

    if (!gameShare) {
      return res.status(404).json({
        success: false,
        message: 'Código no válido o expirado'
      });
    }

    // Verificar si ya expiró
    if (gameShare.expiresAt && new Date() > gameShare.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Este código ha expirado'
      });
    }

    // Verificar máximo de usos
    if (gameShare.maxUses && gameShare.usedBy.length >= gameShare.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'Este código ha alcanzado el máximo de usos'
      });
    }

    res.json({
      success: true,
      data: {
        creator: gameShare.creatorId,
        code: gameShare.code
      }
    });
  } catch (error) {
    console.error('Error verificando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar código',
      error: error.message
    });
  }
};

// Unirse a un juego compartido
const joinGame = async (req, res) => {
  try {
    const playerId = req.user._id;
    const { code } = req.body;

    // Verificar código
    const gameShare = await GameShare.findOne({ code, active: true });
    
    if (!gameShare) {
      return res.status(404).json({
        success: false,
        message: 'Código no válido o expirado'
      });
    }

    // No permitir que el creador use su propio código
    if (gameShare.creatorId.toString() === playerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes usar tu propio código'
      });
    }

    // Verificar si ya ha usado este código
    const alreadyUsed = gameShare.usedBy.some(
      u => u.userId.toString() === playerId.toString()
    );

    // Crear instancia de juego
    let gameInstance = await GameInstance.findOne({
      playerId,
      creatorId: gameShare.creatorId,
      shareCode: code,
      active: true
    });

    if (!gameInstance) {
      gameInstance = new GameInstance({
        playerId,
        creatorId: gameShare.creatorId,
        shareCode: code,
        active: true
      });
      await gameInstance.save();

      // Añadir a la lista de usuarios que han usado el código
      if (!alreadyUsed) {
        gameShare.usedBy.push({
          userId: playerId,
          joinedAt: new Date()
        });
        await gameShare.save();
      }

      // Añadir instancia a las activas del usuario
      await User.findByIdAndUpdate(playerId, {
        $addToSet: { activeGameInstances: gameInstance._id }
      });
    }

    // Generar primer set de juego
    if (!gameInstance.currentSetId) {
      const gameSet = await generateNewGameSet(gameShare.creatorId, gameInstance._id);
      gameInstance.currentSetId = gameSet._id;
      await gameInstance.save();
    }

    res.json({
      success: true,
      message: 'Te has unido al juego exitosamente',
      data: { gameInstance }
    });
  } catch (error) {
    console.error('Error uniéndose al juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al unirse al juego',
      error: error.message
    });
  }
};

// Obtener instancias de juego activas del usuario
const getGameInstances = async (req, res) => {
  try {
    const userId = req.user._id;

    const instances = await GameInstance.find({
      playerId: userId,
      active: true
    })
      .populate('creatorId', 'name email')
      .populate('currentSetId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { instances }
    });
  } catch (error) {
    console.error('Error obteniendo instancias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener instancias',
      error: error.message
    });
  }
};

// Desactivar código de compartición
const deactivateShareCode = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user._id;

    const gameShare = await GameShare.findOne({ _id: id, creatorId });

    if (!gameShare) {
      return res.status(404).json({
        success: false,
        message: 'Código no encontrado'
      });
    }

    gameShare.active = false;
    await gameShare.save();

    res.json({
      success: true,
      message: 'Código desactivado'
    });
  } catch (error) {
    console.error('Error desactivando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar código',
      error: error.message
    });
  }
};

module.exports = {
  createShareCode,
  getUserShareCodes,
  verifyShareCode,
  joinGame,
  getGameInstances,
  deactivateShareCode
};