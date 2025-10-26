/**
 * @fileoverview Servicio de Niveles
 * @description Genera niveles de juego a partir de datos personalizados del usuario
 */

const { Level, Variable, UserData } = require('../models');
const { hashAnswer, hashPuzzleAnswer, hashDateAnswer, generateSalt } = require('../utils/hash.util');
const { selectRandomItems } = require('../utils/seed.util');

/**
 * @function generateLevels
 * @async
 * @description Genera múltiples niveles seleccionando aleatoriamente datos del usuario
 * @param {string} userId - ID del usuario propietario de los datos
 * @param {string} gameSetId - ID del GameSet al que pertenecerán los niveles
 * @param {string} seed - Semilla para selección aleatoria determinista
 * @param {number} levelCount - Cantidad de niveles a generar (default: 5)
 * @returns {Promise<Level[]>} Array de niveles generados
 * @throws {Error} Si el usuario no tiene datos personalizados
 */
const generateLevels = async (userId, gameSetId, seed, levelCount = 5) => {
  try {
    const levels = [];
    const userDataItems = await UserData.find({ userId, active: true });
    
    if (userDataItems.length === 0) {
      throw new Error('El usuario no tiene datos personalizados aún');
    }

    const selectedUserDataItems = selectRandomItems(userDataItems, levelCount, seed);
    
    const actualLevelCount = Math.min(levelCount, userDataItems.length);

    for (let i = 0; i < actualLevelCount; i++) {
      const level = await createLevelFromUserData(
        selectedUserDataItems[i],
        gameSetId,
        i + 1,
      );

      levels.push(level);
    }

    return levels;
    
  } catch (error) {
    console.error('Error generando niveles:', error);
    throw error;
  }
};

/**
 * @function createLevelFromUserData
 * @async
 * @description Crea un nivel individual a partir de un UserData, hasheando la respuesta
 * @param {UserData} userData - Dato personalizado del usuario
 * @param {string} gameSetId - ID del GameSet
 * @param {number} order - Orden del nivel dentro del set
 * @returns {Promise<Level>} Nivel creado
 * @throws {Error} Si no se puede crear el nivel
 */
const createLevelFromUserData = async (userData, gameSetId, order) => {
  try {
    const variable = await Variable.findOne({ _id: userData.tipoDato });
    
    let levelType = variable.type;

    const salt = generateSalt();
    let answerHash;
    
    if (levelType === 'fecha') {
      answerHash = hashDateAnswer(userData.valor.fecha, salt);
    } else if (levelType === 'foto') {
      answerHash = hashPuzzleAnswer(userData.puzzleGrid || 3, salt);
    } else if (levelType === 'lugar') {
      answerHash = hashAnswer(userData.valor.lugar, salt);
    }else {
      answerHash = hashAnswer(userData.valor.texto, salt);
    }

    const level = new Level({
      tipoDato: userData.tipoDato,
      pregunta: userData.pregunta,
      pistas: userData.pistas || [],
      gameSetId,
      categoryId: userData.categorias,
      difficulty: userData.difficulty || 'medium',
      valor: {
        [levelType]: {
          answerHash,
          salt
        }
      },
      imagePath: userData.imagePath || null,
      puzzleGrid: userData.puzzleGrid || 3,
      maxAttempts: 5,
      currentAttempts: 0,
      completed: false,
      order
    });

    await level.save();
    return level;
    
  } catch (error) {
    console.error('Error creando nivel desde UserData:', error);
    throw error;
  }
};

module.exports = {
  generateLevels
};
