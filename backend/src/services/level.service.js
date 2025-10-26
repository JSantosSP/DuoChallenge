const { Level, Variable, UserData } = require('../models');
const { hashAnswer, hashPuzzleAnswer, hashDateAnswer, generateSalt } = require('../utils/hash.util');
const { selectRandomItems } = require('../utils/seed.util');

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
