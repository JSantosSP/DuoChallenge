/**
 * @fileoverview Controlador de Premios
 * @description Gestiona los premios personalizados que crea cada usuario
 */

const { Prize, GameSet } = require('../models');

/**
 * @function getUserPrizes
 * @async
 * @description Obtiene todos los premios creados por el usuario autenticado
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de premios del usuario
 * @returns {Object} 500 - Error del servidor
 */
const getUserPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    const userPrizes = await Prize.find({ 
      userId, 
      active: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        userPrizes
      }
    });
  } catch (error) {
    console.error('Error obteniendo premios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener premios',
      error: error.message
    });
  }
};

/**
 * @function createPrize
 * @async
 * @description Crea un nuevo premio personalizado
 * @param {Object} req.user - Usuario autenticado
 * @param {Object} req.body - Datos del premio
 * @param {string} req.body.title - Título del premio
 * @param {string} req.body.description - Descripción del premio
 * @param {string} [req.body.imagePath] - Ruta de la imagen
 * @param {number} [req.body.weight=1] - Peso para selección aleatoria
 * @param {string} [req.body.category='personal'] - Categoría del premio
 * @returns {Object} 201 - Premio creado
 * @returns {Object} 400 - Título o descripción faltantes
 * @returns {Object} 500 - Error del servidor
 */
const createPrize = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, imagePath, weight, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Título y descripción son requeridos'
      });
    }

    const prize = new Prize({
      userId,
      title,
      description,
      imagePath: imagePath || null,
      weight: weight || 1,
      category: category || 'personal',
      active: true
    });

    await prize.save();

    res.status(201).json({
      success: true,
      message: 'Premio creado exitosamente',
      data: { prize }
    });
  } catch (error) {
    console.error('Error creando premio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear premio',
      error: error.message
    });
  }
};

/**
 * @function updatePrize
 * @async
 * @description Actualiza un premio del usuario
 * @param {string} req.params.id - ID del premio
 * @param {Object} req.user - Usuario autenticado
 * @param {Object} req.body - Campos a actualizar
 * @returns {Object} 200 - Premio actualizado
 * @returns {Object} 404 - Premio no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const updatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const prize = await Prize.findOne({ 
      _id: id, 
      userId, 
    });

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: 'Premio no encontrado o no tienes permiso'
      });
    }

    const allowedFields = ['title', 'description', 'imagePath', 'weight', 'category'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        prize[field] = updates[field];
      }
    });

    await prize.save();

    res.json({
      success: true,
      message: 'Premio actualizado',
      data: { prize }
    });
  } catch (error) {
    console.error('Error actualizando premio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar premio',
      error: error.message
    });
  }
};

/**
 * @function deletePrize
 * @async
 * @description Desactiva un premio (soft delete)
 * @param {string} req.params.id - ID del premio
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Premio eliminado
 * @returns {Object} 404 - Premio no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const deletePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const prize = await Prize.findOne({ 
      _id: id, 
      userId
    });

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: 'Premio no encontrado o no tienes permiso'
      });
    }

    prize.active = false;
    await prize.save();

    res.json({
      success: true,
      message: 'Premio eliminado'
    });
  } catch (error) {
    console.error('Error eliminando premio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar premio',
      error: error.message
    });
  }
};

/**
 * @function getUserWonPrizes
 * @async
 * @description Obtiene los premios ganados por el usuario al completar juegos
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de premios ganados con información del juego
 * @returns {Object} 500 - Error del servidor
 */
const getUserWonPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    const completedSets = await GameSet.find({ 
      userId, 
      status: 'completed',
      prizeId: { $ne: null }
    })
      .populate('prizeId')
      .sort({ completedAt: -1 });

    const wonPrizes = completedSets
      .filter(set => set.prizeId)
      .map(set => ({
        _id: set.prizeId._id,
        prizeId: set.prizeId._id,
        title: set.prizeId.title,
        description: set.prizeId.description,
        imagePath: set.prizeId.imagePath,
        weight: set.prizeId.weight,
        completedAt: set.completedAt,
        gameSetId: set._id,
        used: set.prizeId.used,
        usedAt: set.prizeId.usedAt
      }));

    res.json({
      success: true,
      data: {
        prizes: wonPrizes,
        total: wonPrizes.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo premios ganados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener premios ganados',
      error: error.message
    });
  }
};

/**
 * @function reactivatePrize
 * @async
 * @description Reactiva un premio usado para que pueda ser asignado nuevamente
 * @param {string} req.params.id - ID del premio
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Premio reactivado
 * @returns {Object} 403 - Sin permisos
 * @returns {Object} 404 - Premio no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const reactivatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const prize = await Prize.findOne({ _id: id });

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: 'Premio no encontrado'
      });
    }

    if (prize.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para reactivar este premio'
      });
    }

    prize.used = false;
    prize.usedAt = null;
    await prize.save();

    res.json({
      success: true,
      message: 'Premio reactivado exitosamente',
      data: { prize }
    });

  } catch (error) {
    console.error('Error reactivando premio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar premio',
      error: error.message
    });
  }
};

/**
 * @function reactivateAllPrizes
 * @async
 * @description Reactiva todos los premios usados del usuario
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Cantidad de premios reactivados
 * @returns {Object} 500 - Error del servidor
 */
const reactivateAllPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Prize.updateMany(
      { 
        userId, 
        used: true 
      },
      { 
        $set: { 
          used: false,
          usedAt: null 
        } 
      }
    );

    res.json({
      success: true,
      message: `Se reactivaron ${result.modifiedCount} premio(s)`,
      data: { 
        reactivatedCount: result.modifiedCount 
      }
    });

  } catch (error) {
    console.error('Error reactivando todos los premios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar premios',
      error: error.message
    });
  }
};

module.exports = {
  getUserPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  getUserWonPrizes,
  reactivatePrize,
  reactivateAllPrizes
};
