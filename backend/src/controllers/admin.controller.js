const { 
  ChallengeTemplate, 
  Variable, 
  Prize, 
  User,
  Challenge,
  Level,
  GameSet
} = require('../models');
const { generateNewGameSet, resetAndGenerateNewSet } = require('../services/gameset.service');
const { resetPrizes } = require('../services/prize.service');

// ========== PLANTILLAS ==========

const getTemplates = async (req, res) => {
  try {
    const templates = await ChallengeTemplate.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { templates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const template = new ChallengeTemplate(req.body);
    await template.save();
    res.status(201).json({ 
      success: true, 
      message: 'Plantilla creada',
      data: { template } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await ChallengeTemplate.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
    }
    
    res.json({ success: true, data: { template } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await ChallengeTemplate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Plantilla eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== VARIABLES ==========

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

// ========== PREMIOS ==========

const getPrizes = async (req, res) => {
  try {
    const prizes = await Prize.find()
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { prizes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPrize = async (req, res) => {
  try {
    const prize = new Prize(req.body);
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
    const prize = await Prize.findByIdAndUpdate(
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
    await Prize.findByIdAndDelete(id);
    res.json({ success: true, message: 'Premio eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPrizesController = async (req, res) => {
  try {
    await resetPrizes();
    res.json({ success: true, message: 'Todos los premios han sido reiniciados' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== USUARIOS ==========

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
      .populate('completedChallenges')
      .populate('completedLevels');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateGameForUser = async (req, res) => {
  try {
    const { id } = req.params;
    const gameSet = await generateNewGameSet(id);
    res.json({ 
      success: true, 
      message: 'Juego generado para el usuario',
      data: { gameSet } 
    });
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

// ========== UPLOAD ==========

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        path: imagePath,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== ESTADÍSTICAS ==========

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalTemplates = await ChallengeTemplate.countDocuments();
    const activeTemplates = await ChallengeTemplate.countDocuments({ active: true });
    
    const totalPrizes = await Prize.countDocuments();
    const usedPrizes = await Prize.countDocuments({ used: true });
    const availablePrizes = await Prize.countDocuments({ used: false, active: true });
    
    const totalChallenges = await Challenge.countDocuments();
    const completedChallenges = await Challenge.countDocuments({ completed: true });
    
    const totalLevels = await Level.countDocuments();
    const completedLevels = await Level.countDocuments({ completed: true });
    
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
        templates: {
          total: totalTemplates,
          active: activeTemplates
        },
        prizes: {
          total: totalPrizes,
          used: usedPrizes,
          available: availablePrizes
        },
        challenges: {
          total: totalChallenges,
          completed: completedChallenges,
          completionRate: totalChallenges > 0 
            ? Math.round((completedChallenges / totalChallenges) * 100) 
            : 0
        },
        levels: {
          total: totalLevels,
          completed: completedLevels
        },
        gameSets: {
          total: totalGameSets,
          completed: completedGameSets,
          active: activeGameSets
        },
        variables: {
          total: totalVariables
        }
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

module.exports = {
  // Templates
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  // Variables
  getVariables,
  createVariable,
  updateVariable,
  deleteVariable,
  // Prizes
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  resetPrizes: resetPrizesController,
  // Users
  getUsers,
  getUserById,
  generateGameForUser,
  resetUserProgress,
  getUserDataById,
  // Upload
  uploadImage,
  // Stats
  getStats
};