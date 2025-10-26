/**
 * @fileoverview Controlador de Administración
 * @description Gestiona operaciones administrativas: variables, premios, usuarios y estadísticas
 */

const {  
  Variable,
  User,
  GameSet,
  PrizeTemplate,
  Prize
} = require('../models');
const { resetAndGenerateNewSet } = require('../services/gameset.service');

/**
 * @function getVariables
 * @async
 * @description Obtiene todas las variables (tipos de dato) del sistema
 * @returns {Object} 200 - Lista de variables
 * @returns {Object} 500 - Error del servidor
 */
const getVariables = async (req, res) => {
  try {
    const variables = await Variable.find().sort({ key: 1 });
    res.json({ success: true, data: { variables } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function createVariable
 * @async
 * @description Crea una nueva variable (tipo de dato)
 * @param {Object} req.body - Datos de la variable
 * @returns {Object} 201 - Variable creada
 * @returns {Object} 500 - Error del servidor
 */
const createVariable = async (req, res) => {
  try {
    const variable = new Variable(req.body);
    await variable.save();
    res.status(201).json({ 
      success: true, 
      message: 'Variable creada',
      data: { variable } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function updateVariable
 * @async
 * @description Actualiza una variable existente
 * @param {string} req.params.id - ID de la variable
 * @param {Object} req.body - Datos a actualizar
 * @returns {Object} 200 - Variable actualizada
 * @returns {Object} 404 - Variable no encontrada
 * @returns {Object} 500 - Error del servidor
 */
const updateVariable = async (req, res) => {
  try {
    const { id } = req.params;
    const variable = await Variable.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    
    if (!variable) {
      return res.status(404).json({ success: false, message: 'Variable no encontrada' });
    }
    
    res.json({ success: true, data: { variable } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function deleteVariable
 * @async
 * @description Elimina una variable del sistema
 * @param {string} req.params.id - ID de la variable
 * @returns {Object} 200 - Variable eliminada
 * @returns {Object} 500 - Error del servidor
 */
const deleteVariable = async (req, res) => {
  try {
    const { id } = req.params;
    await Variable.findByIdAndDelete(id);
    res.json({ success: true, message: 'Variable eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getPrizes
 * @async
 * @description Obtiene todas las plantillas de premios
 * @returns {Object} 200 - Lista de plantillas de premios
 * @returns {Object} 500 - Error del servidor
 */
const getPrizes = async (req, res) => {
  try {
    const prizes = await PrizeTemplate.find()
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { prizes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function createPrize
 * @async
 * @description Crea una nueva plantilla de premio
 * @param {Object} req.body - Datos del premio
 * @returns {Object} 201 - Premio creado
 * @returns {Object} 500 - Error del servidor
 */
const createPrize = async (req, res) => {
  try {
    const prize = new PrizeTemplate(req.body);
    await prize.save();
    res.status(201).json({ 
      success: true, 
      message: 'Premio creado',
      data: { prize } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function updatePrize
 * @async
 * @description Actualiza una plantilla de premio
 * @param {string} req.params.id - ID del premio
 * @param {Object} req.body - Datos a actualizar
 * @returns {Object} 200 - Premio actualizado
 * @returns {Object} 404 - Premio no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const updatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const prize = await PrizeTemplate.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    
    if (!prize) {
      return res.status(404).json({ success: false, message: 'Premio no encontrado' });
    }
    
    res.json({ success: true, data: { prize } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function deletePrize
 * @async
 * @description Elimina una plantilla de premio
 * @param {string} req.params.id - ID del premio
 * @returns {Object} 200 - Premio eliminado
 * @returns {Object} 500 - Error del servidor
 */
const deletePrize = async (req, res) => {
  try {
    const { id } = req.params;
    await PrizeTemplate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Premio eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getUsers
 * @async
 * @description Obtiene todos los usuarios del sistema
 * @returns {Object} 200 - Lista de usuarios
 * @returns {Object} 500 - Error del servidor
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('currentSetId')
      .populate('currentPrizeId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getUserById
 * @async
 * @description Obtiene un usuario específico por ID
 * @param {string} req.params.id - ID del usuario
 * @returns {Object} 200 - Datos del usuario
 * @returns {Object} 404 - Usuario no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate('currentSetId')
      .populate('currentPrizeId')
      .populate('completedLevels');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function resetUserProgress
 * @async
 * @description Reinicia el progreso de un usuario y genera un nuevo set
 * @param {string} req.params.id - ID del usuario
 * @returns {Object} 200 - Nuevo set generado
 * @returns {Object} 500 - Error del servidor
 */
const resetUserProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await resetAndGenerateNewSet(id);
    res.json({ 
      success: true, 
      message: 'Progreso del usuario reiniciado',
      data: result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function uploadImage
 * @async
 * @description Gestiona la subida de una imagen al servidor
 * @param {Object} req.file - Archivo subido (procesado por multer)
 * @returns {Object} 200 - Información del archivo subido
 * @returns {Object} 400 - No se proporcionó archivo
 * @returns {Object} 500 - Error del servidor
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${imagePath}`;

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        path: imagePath,
        fullUrl: fullUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getStats
 * @async
 * @description Obtiene estadísticas globales del sistema
 * @returns {Object} 200 - Estadísticas de usuarios, premios y juegos
 * @returns {Object} 500 - Error del servidor
 */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalPrizes = await Prize.countDocuments();
    const usedPrizes = await Prize.countDocuments({ used: true });
    const availablePrizes = await Prize.countDocuments({ used: false, active: true });
    
    const totalGameSets = await GameSet.countDocuments();
    const completedGameSets = await GameSet.countDocuments({ completed: true });
    const activeGameSets = await GameSet.countDocuments({ active: true });

    const totalVariables = await Variable.countDocuments();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          players: totalPlayers,
          admins: totalAdmins
        },
        prizes: {
          total: totalPrizes,
          used: usedPrizes,
          available: availablePrizes
        },
        gameSets: {
          total: totalGameSets,
          completed: completedGameSets,
          active: activeGameSets
        },
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getUserDataById
 * @async
 * @description Obtiene los datos personalizados de un usuario específico
 * @param {string} req.params.id - ID del usuario
 * @returns {Object} 200 - Lista de datos del usuario
 * @returns {Object} 500 - Error del servidor
 */
const getUserDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const { UserData } = require('../models');

    const userData = await UserData.find({ userId: id, active: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { userData }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function getAllUserData
 * @async
 * @description Obtiene todos los datos personalizados del sistema con filtros opcionales
 * @param {string} [req.query.tipoDato] - Filtrar por tipo de dato
 * @param {string} [req.query.active] - Filtrar por estado activo
 * @returns {Object} 200 - Lista de datos personalizados
 * @returns {Object} 500 - Error del servidor
 */
const getAllUserData = async (req, res) => {
  try {
    const { UserData } = require('../models');
    const { tipoDato, active } = req.query;
    
    const filter = {};
    if (tipoDato) filter.tipoDato = tipoDato;
    if (active !== undefined) filter.active = active === 'true';
    
    const userData = await UserData.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000);
    
    res.json({
      success: true,
      data: { userData }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @function toggleUserDataActive
 * @async
 * @description Activa/desactiva un dato personalizado
 * @param {string} req.params.id - ID del dato
 * @returns {Object} 200 - Dato actualizado
 * @returns {Object} 404 - Dato no encontrado
 * @returns {Object} 500 - Error del servidor
 */
const toggleUserDataActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { UserData } = require('../models');
    
    const userData = await UserData.findById(id);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'Dato no encontrado' });
    }
    
    userData.active = !userData.active;
    await userData.save();
    
    res.json({
      success: true,
      message: `Dato ${userData.active ? 'activado' : 'desactivado'} exitosamente`,
      data: { userData }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVariables,
  createVariable,
  updateVariable,
  deleteVariable,
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  getUsers,
  getUserById,
  resetUserProgress,
  getUserDataById,
  uploadImage,
  getStats,
  getAllUserData,
  toggleUserDataActive,
};
