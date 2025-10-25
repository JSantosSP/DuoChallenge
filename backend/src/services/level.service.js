const { Level, Variable, UserData } = require('../models');
const { hashAnswer, hashPuzzleAnswer, hashDateAnswer, generateSalt } = require('../utils/hash.util');
const { selectRandomItems } = require('../utils/seed.util');

/**
 * Genera niveles con sus niveles
 */
const generateLevels = async (userId, gameSetId, seed, levelCount = 5) => {
  try {
    const levels = [];
    const userDataItems = await UserData.find({ userId, active: true });
    
    if (userDataItems.length === 0) {
      throw new Error('El usuario no tiene datos personalizados aún');
    }

    // Usar selectRandomItems para garantizar que no haya repeticiones
    // Si hay menos items que levelCount, se usarán todos los disponibles sin repetir
    const selectedUserDataItems = selectRandomItems(userDataItems, levelCount, seed);
    
    // Si no hay suficientes items únicos, ajustar levelCount
    const actualLevelCount = Math.min(levelCount, userDataItems.length);

    for (let i = 0; i < actualLevelCount; i++) {
      // Crear nivel
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
 * Crea un reto desde un UserData
 */
const createLevelFromUserData = async (userData, gameSetId, order) => {
  try {
    // Obtener el tipo de variable para determinar el tipo de reto
    const variable = await Variable.findOne({ _id: userData.tipoDato });
    
    let levelType = variable.type; //'foto', 'fecha', 'lugar', 'texto'

    // Generar salt y hash de la respuesta)
    const salt = generateSalt();
    let answerHash;
    
    // Para fechas, usar normalización específica
    if (levelType === 'fecha') {
      answerHash = hashDateAnswer(userData.valor.fecha, salt);
    } else if (levelType === 'foto') {
      // Para puzzles, el hash representa el orden correcto [1,2,3,...]
      answerHash = hashPuzzleAnswer(userData.puzzleGrid || 3, salt);
    } else if (levelType === 'lugar') {
      answerHash = hashAnswer(userData.valor.lugar, salt);
    }else {
      answerHash = hashAnswer(userData.valor.texto, salt);
    }

    // Crear el reto
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
