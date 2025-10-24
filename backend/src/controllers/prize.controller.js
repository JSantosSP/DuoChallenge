const { Prize, GameSet } = require('../models');

// Obtener premios del usuario (propios + sistema)
const getUserPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Premios propios del usuario
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

// Crear nuevo premio
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

// Actualizar premio
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

    // Actualizar campos permitidos
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

// Eliminar premio (soft delete)
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

// Obtener premios ganados por el usuario
const getUserWonPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar todos los GameSets completados con premio
    const completedSets = await GameSet.find({ 
      userId, 
      status: 'completed',
      prizeId: { $ne: null }
    })
      .populate('prizeId')
      .sort({ completedAt: -1 });

    // Mapear los premios con información del juego
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

// Reactivar un premio específico (marcar como no usado)
const reactivatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar el premio y verificar que pertenece al usuario
    const prize = await Prize.findOne({ _id: id });

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: 'Premio no encontrado'
      });
    }

    // Verificar que el usuario es el dueño del premio
    if (prize.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para reactivar este premio'
      });
    }

    // Reactivar el premio
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

// Reactivar todos los premios del usuario
const reactivateAllPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar todos los premios del usuario que están marcados como usados
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