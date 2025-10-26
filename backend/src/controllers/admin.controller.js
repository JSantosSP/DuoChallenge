const {  
  Variable,
  User,
  GameSet,
  PrizeTemplate,
  Prize
} = require('../models');
const { resetAndGenerateNewSet } = require('../services/gameset.service');

const getVariables = async (req, res) => {
  try {
    const variables = await Variable.find().sort({ key: 1 });
    res.json({ success: true, data: { variables } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const deleteVariable = async (req, res) => {
  try {
    const { id } = req.params;
    await Variable.findByIdAndDelete(id);
    res.json({ success: true, message: 'Variable eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPrizes = async (req, res) => {
  try {
    const prizes = await PrizeTemplate.find()
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { prizes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const deletePrize = async (req, res) => {
  try {
    const { id } = req.params;
    await PrizeTemplate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Premio eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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