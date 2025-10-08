const { Prize } = require('../models');

// Obtener premios del usuario (propios + sistema)
const getUserPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Premios propios del usuario
    const userPrizes = await Prize.find({ 
      userId, 
      active: true 
    }).sort({ createdAt: -1 });

    // Premios del sistema (default)
    const systemPrizes = await Prize.find({ 
      isDefault: true, 
      active: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        userPrizes,
        systemPrizes,
        allPrizes: [...userPrizes, ...systemPrizes]
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
      isDefault: false,
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
      isDefault: false // Solo puede editar sus propios premios
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
      userId,
      isDefault: false 
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

module.exports = {
  getUserPrizes,
  createPrize,
  updatePrize,
  deletePrize
};