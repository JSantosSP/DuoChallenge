/**
 * @fileoverview Controlador de Compartir
 * @description Gestiona la creación y uso de códigos para compartir juegos entre usuarios
 */

const { GameShare, User, UserData } = require('../models');
const { generateNewGameSet } = require('../services/gameset.service');

/**
 * @function generateShareCode
 * @description Genera un código único de 6 caracteres alfanuméricos
 * @returns {string} Código generado
 */
const generateShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * @function createShareCode
 * @async
 * @description Crea un nuevo código para compartir los datos personalizados del usuario
 * @param {Object} req.user - Usuario autenticado (creador del código)
 * @returns {Object} 201 - Código creado
 * @returns {Object} 400 - Usuario sin datos personalizados
 * @returns {Object} 500 - Error del servidor
 */
const createShareCode = async (req, res) => {
  try {
    const creatorId = req.user._id;
    
    const userData = await UserData.find({ userId: creatorId, active: true });
    if (userData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes tener datos personalizados antes de compartir'
      });
    }

    await GameShare.updateMany(
      { creatorId, active: true },
      { active: false }
    );

    let code;
    let exists = true;
    while (exists) {
      code = generateShareCode();
      exists = await GameShare.findOne({ code });
    }

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

/**
 * @function getUserShareCodes
 * @async
 * @description Obtiene todos los códigos creados por el usuario
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de códigos compartidos
 * @returns {Object} 500 - Error del servidor
 */
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

/**
 * @function getUserUsedShareCodes
 * @async
 * @description Obtiene los códigos que el usuario ha utilizado
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de códigos usados
 * @returns {Object} 500 - Error del servidor
 */
const getUserUsedShareCodes = async (req, res) => {
  try {
    const userId = req.user._id;

    const shareCodes = await GameShare.find({ "usedBy.userId":userId, "active": true })
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

/**
 * @function verifyShareCode
 * @async
 * @description Verifica si un código compartido es válido
 * @param {string} req.params.code - Código a verificar
 * @returns {Object} 200 - Código válido con información del creador
 * @returns {Object} 400 - Código expirado o alcanzó límite de usos
 * @returns {Object} 404 - Código no válido
 * @returns {Object} 500 - Error del servidor
 */
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

    if (gameShare.expiresAt && new Date() > gameShare.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Este código ha expirado'
      });
    }

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

/**
 * @function joinGame
 * @async
 * @description Permite a un usuario unirse a un juego usando un código compartido
 * @param {Object} req.user - Usuario autenticado (jugador)
 * @param {Object} req.body - Datos de unión
 * @param {string} req.body.code - Código compartido
 * @returns {Object} 200 - Nuevo set de juego generado
 * @returns {Object} 400 - No puede usar su propio código
 * @returns {Object} 404 - Código no válido
 * @returns {Object} 500 - Error del servidor
 */
const joinGame = async (req, res) => {
  try {
    const playerId = req.user._id;
    const { code } = req.body;

    const gameShare = await GameShare.findOne({ code, active: true });
    
    if (!gameShare) {
      return res.status(404).json({
        success: false,
        message: 'Código no válido o expirado'
      });
    }

    if (gameShare.creatorId.toString() === playerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes usar tu propio código'
      });
    }

    const alreadyUsed = gameShare.usedBy.some(
      u => u.userId.toString() === playerId.toString()
    );

    if (!alreadyUsed) {
      gameShare.usedBy.push({
        userId: playerId,
        joinedAt: new Date()
      });
      await gameShare.save();
    }

    const gameSet = await generateNewGameSet(
      gameShare.creatorId,
      playerId,
      gameShare._id,
      code
    );

    await gameSet.populate('levels');

    res.json({
      success: true,
      message: alreadyUsed 
        ? 'Nuevo juego generado exitosamente' 
        : 'Te has unido al juego exitosamente',
      data: { gameSet }
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

/**
 * @function getGameInstances
 * @async
 * @description Obtiene las instancias de juegos compartidos del usuario
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de sets de juego compartidos
 * @returns {Object} 500 - Error del servidor
 */
const getGameInstances = async (req, res) => {
  try {
    const userId = req.user._id;
    const { GameSet } = require('../models');

    const gameSets = await GameSet.find({
      userId: userId,
      shareId: { $ne: null }
    })
      .populate('creatorId', 'name email')
      .populate('shareId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { gameSets }
    });
  } catch (error) {
    console.error('Error obteniendo juegos compartidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener juegos',
      error: error.message
    });
  }
};

/**
 * @function deactivateShareCode
 * @async
 * @description Desactiva un código compartido
 * @param {string} req.params.id - ID del código
 * @param {Object} req.user - Usuario autenticado (debe ser el creador)
 * @returns {Object} 200 - Código desactivado
 * @returns {Object} 404 - Código no encontrado
 * @returns {Object} 500 - Error del servidor
 */
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
  getUserUsedShareCodes,
  verifyShareCode,
  joinGame,
  getGameInstances,
  deactivateShareCode
};
