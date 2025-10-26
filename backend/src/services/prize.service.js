const { Prize, User } = require('../models');
const { seededRandom } = require('../utils/seed.util');

const assignPrize = async (userId, seed) => {
  try {
    const availablePrizes = await Prize.find({ 
      userId, active: true, used: false
    });

    if (availablePrizes.length === 0) {
      throw new Error('No hay premios disponibles');
    }

    const selectedPrize = selectPrizeByWeight(availablePrizes, seed);

    selectedPrize.used = true;
    selectedPrize.usedBy = userId;
    selectedPrize.usedAt = new Date();
    await selectedPrize.save();

    await User.findByIdAndUpdate(userId, {
      $push: { currentPrizeId: selectedPrize._id }
    });

    return selectedPrize;
    
  } catch (error) {
    console.error('Error asignando premio:', error);
    throw error;
  }
};

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

const getUserPrize = async (userId) => {
  try {
    const user = await User.findById(userId).populate('currentPrizeId');
    return user.currentPrizeId;
  } catch (error) {
    console.error('Error obteniendo premio del usuario:', error);
    throw error;
  }
};

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