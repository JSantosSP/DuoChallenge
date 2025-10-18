const { Prize, User } = require('../models');
const { seededRandom } = require('../utils/seed.util');

/**
 * Asigna un premio aleatorio al usuario (de sus premios + sistema)
 */
const assignPrize = async (userId, seed) => {
  try {
    // Buscar premios disponibles del usuario y del sistema
    const availablePrizes = await Prize.find({ 
      userId, active: true, used: false  // Premios del usuario
    });

    if (availablePrizes.length === 0) {
      throw new Error('No hay premios disponibles');
    }

    // Seleccionar premio basado en peso
    const selectedPrize = selectPrizeByWeight(availablePrizes, seed);

    // Marcar premio como usado
    selectedPrize.used = true;
    selectedPrize.usedBy = userId;
    selectedPrize.usedAt = new Date();
    await selectedPrize.save();

    // Actualizar usuario
    await User.findByIdAndUpdate(userId, {
      $push: { currentPrizeId: selectedPrize._id }
    });

    return selectedPrize;
    
  } catch (error) {
    console.error('Error asignando premio:', error);
    throw error;
  }
};

/**
 * Selecciona un premio basado en pesos
 */
const selectPrizeByWeight = (prizes, seed) => {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  const random = seededRandom(seed, 0) * totalWeight;
  
  let currentWeight = 0;
  for (const prize of prizes) {
    currentWeight += prize.weight;
    if (random <= currentWeight) {
      return prize;
    }
  }
  
  return prizes[prizes.length - 1];
};

/**
 * Obtiene el premio actual de un usuario
 */
const getUserPrize = async (userId) => {
  try {
    const user = await User.findById(userId).populate('currentPrizeId');
    return user.currentPrizeId;
  } catch (error) {
    console.error('Error obteniendo premio del usuario:', error);
    throw error;
  }
};

/**
 * Reinicia premios del usuario (marca todos como no usados)
 */
const resetUserPrizes = async (userId) => {
  try {
    await Prize.updateMany(
      {  userId },
      {
        used: false,
        usedBy: null,
        usedAt: null
      }
    );
    
    return { success: true, message: 'Premios reiniciados' };
  } catch (error) {
    console.error('Error reiniciando premios:', error);
    throw error;
  }
};



module.exports = {
  assignPrize,
  getUserPrize,
  resetUserPrizes,
  selectPrizeByWeight
};