const { UserData, Variable } = require('../models');

// Obtener todos los datos del usuario
const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const userData = await UserData.find({ userId, active: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { userData }
    });
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos',
      error: error.message
    });
  }
};

// Crear nuevo dato
const createUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tipoDato, valor, pregunta, pistas, categorias, imagePath, difficulty } = req.body;

    // Validar que el tipoDato existe en Variables
    const variable = await Variable.findOne({ _id: tipoDato, active: true });
    if (!variable) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de dato no válido'
      });
    }

    // Validar tipo de dato vs valor
    if (variable.type === 'date') {
      // Validar formato fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(valor)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
    }

    const userDataItem = new UserData({
      userId,
      tipoDato,
      valor,
      pregunta,
      pistas: pistas || [],
      categorias: categorias || [],
      imagePath: imagePath || null
    });

    await userDataItem.save();

    res.status(201).json({
      success: true,
      message: 'Dato creado exitosamente',
      data: { userDataItem }
    });
  } catch (error) {
    console.error('Error creando dato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear dato',
      error: error.message
    });
  }
};

// Actualizar dato
const updateUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const userDataItem = await UserData.findOne({ _id: id, userId });

    if (!userDataItem) {
      return res.status(404).json({
        success: false,
        message: 'Dato no encontrado'
      });
    }

    // Actualizar campos
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        userDataItem[key] = updates[key];
      }
    });

    await userDataItem.save();

    res.json({
      success: true,
      message: 'Dato actualizado',
      data: { userDataItem }
    });
  } catch (error) {
    console.error('Error actualizando dato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar dato',
      error: error.message
    });
  }
};

// Eliminar dato (soft delete)
const deleteUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const userDataItem = await UserData.findOne({ _id: id, userId });

    if (!userDataItem) {
      return res.status(404).json({
        success: false,
        message: 'Dato no encontrado'
      });
    }

    userDataItem.active = false;
    await userDataItem.save();

    res.json({
      success: true,
      message: 'Dato eliminado'
    });
  } catch (error) {
    console.error('Error eliminando dato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar dato',
      error: error.message
    });
  }
};

// Obtener tipos de datos disponibles
const getAvailableTypes = async (req, res) => {
  try {
    const variables = await Variable.find({ active: true })
      .sort({ key: 1 });

    res.json({
      success: true,
      data: { variables }
    });
  } catch (error) {
    console.error('Error obteniendo tipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos disponibles',
      error: error.message
    });
  }
};

module.exports = {
  getUserData,
  createUserData,
  updateUserData,
  deleteUserData,
  getAvailableTypes
};