/**
 * @fileoverview Controlador de Datos de Usuario
 * @description Gestiona los datos personalizados que crea cada usuario para generar niveles
 */

const { UserData, Variable } = require('../models');

/**
 * @function getUserData
 * @async
 * @description Obtiene todos los datos personalizados del usuario autenticado
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Lista de datos del usuario
 * @returns {Object} 500 - Error del servidor
 */
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

/**
 * @function createUserData
 * @async
 * @description Crea un nuevo dato personalizado para el usuario
 * @param {Object} req.user - Usuario autenticado
 * @param {Object} req.body - Datos del nuevo elemento
 * @param {string} req.body.tipoDato - ID del tipo de dato (Variable)
 * @param {Object} req.body.valor - Valor/respuesta del dato
 * @param {string} req.body.pregunta - Pregunta asociada
 * @param {string[]} [req.body.pistas] - Array de pistas
 * @param {string} req.body.categorias - ID de la categoría
 * @param {string} [req.body.imagePath] - Ruta de la imagen (para tipo foto)
 * @param {string} [req.body.difficulty] - Dificultad (easy/medium/hard)
 * @returns {Object} 201 - Dato creado
 * @returns {Object} 400 - Tipo de dato inválido o formato de fecha incorrecto
 * @returns {Object} 500 - Error del servidor
 */
const createUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tipoDato, valor, pregunta, pistas, categorias, imagePath, difficulty } = req.body;

    const variable = await Variable.findOne({ _id: tipoDato, active: true });
    if (!variable) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de dato no válido'
      });
    }

    if (variable.type === 'date') {
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

/**
 * @function updateUserData
 * @async
 * @description Actualiza un dato personalizado del usuario
 * @param {string} req.params.id - ID del dato a actualizar
 * @param {Object} req.user - Usuario autenticado
 * @param {Object} req.body - Campos a actualizar
 * @returns {Object} 200 - Dato actualizado
 * @returns {Object} 404 - Dato no encontrado
 * @returns {Object} 500 - Error del servidor
 */
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

/**
 * @function deleteUserData
 * @async
 * @description Desactiva un dato personalizado (soft delete)
 * @param {string} req.params.id - ID del dato a eliminar
 * @param {Object} req.user - Usuario autenticado
 * @returns {Object} 200 - Dato eliminado
 * @returns {Object} 404 - Dato no encontrado
 * @returns {Object} 500 - Error del servidor
 */
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

/**
 * @function getAvailableTypes
 * @async
 * @description Obtiene todos los tipos de datos disponibles (Variables activas)
 * @returns {Object} 200 - Lista de variables/tipos disponibles
 * @returns {Object} 500 - Error del servidor
 */
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
