/**
 * @fileoverview Servicio de Premios
 * @description Gestiona la lógica de asignación y selección de premios
 */

const { Prize, User } = require('../models');
const { seededRandom } = require('../utils/seed.util');

/**
 * @function assignPrize
 * @async
 * @description Asigna un premio aleatorio ponderado al completar un set de juego
 * @param {string} userId - ID del usuario propietario de los premios
 * @param {string} seed - Semilla para selección aleatoria determinista
 * @returns {Promise<Prize>} Premio asignado y marcado como usado
 * @throws {Error} Si no hay premios disponibles
 */
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

/**
 * @function selectPrizeByWeight
 * @description Selecciona un premio usando selección aleatoria ponderada
 * @param {Prize[]} prizes - Array de premios disponibles
 * @param {string} seed - Semilla para generación aleatoria determinista
 * @returns {Prize} Premio seleccionado
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
 * @function getUserPrize
 * @async
 * @description Obtiene el premio actual del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Prize|null>} Premio del usuario o null
 * @throws {Error} Si hay error al consultar
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
 * @function resetUserPrizes
 * @async
 * @description Marca todos los premios del usuario como no usados
 * @param {string} userId - ID del usuario
 * @returns {Promise<{success: boolean, message: string}>} Resultado de la operación
 * @throws {Error} Si hay error al reiniciar
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
