const { ChallengeTemplate, Challenge, Variable } = require('../models');
const { generateSalt, hashAnswer } = require('../utils/hash.util');
const { replaceVariables, extractVariables } = require('../utils/template.util');
const { selectRandomItems } = require('../utils/seed.util');

/**
 * Obtiene valores de variables desde UserData del usuario
 */
const getUserDataValues = async (userId, variableKeys) => {
  const values = {};
  
  for (const key of variableKeys) {
    // Buscar en los datos del usuario
    const userData = await UserData.findOne({ 
      userId, 
      tipoDato: key, 
      active: true 
    });
    
    if (userData) {
      values[key] = userData.valor;
    } else {
      // Valor por defecto si no existe
      values[key] = `[${key}]`;
    }
  }
  
  return values;
};

/**
 * Genera retos a partir de UserData del usuario
 */
const generateChallengesFromUserData = async (userId, levelId, seed, count = 3) => {
  try {
    // Obtener todos los datos del usuario
    const userDataItems = await UserData.find({ userId, active: true });
    
    if (userDataItems.length === 0) {
      throw new Error('El usuario no tiene datos personalizados aún');
    }

    // Seleccionar datos aleatorios
    const selectedData = selectRandomItems(userDataItems, count, seed);
    
    // Generar retos
    const challenges = [];
    
    for (let i = 0; i < selectedData.length; i++) {
      const dataItem = selectedData[i];
      const challenge = await createChallengeFromUserData(
        dataItem,
        userId,
        levelId,
        i + 1
      );
      challenges.push(challenge);
    }

    return challenges;
    
  } catch (error) {
    console.error('Error generando retos desde UserData:', error);
    throw error;
  }
};

/**
 * Crea un reto desde un UserData
 */
const createChallengeFromUserData = async (userData, userId, levelId, order) => {
  try {
    // Obtener el tipo de variable para determinar el tipo de reto
    const variable = await Variable.findOne({ key: userData.tipoDato });
    
    let challengeType = 'text'; // Por defecto tipo texto
    if (variable) {
      if (variable.type === 'date') challengeType = 'date';
      else if (variable.type === 'image') challengeType = 'photo';
      else challengeType = 'text'; // text, location, number → tipo 'text'
    }

    // Generar salt y hash de la respuesta
    const salt = generateSalt();
    const answerHash = hashAnswer(userData.valor, salt);

    // Crear el reto
    const challenge = new Challenge({
      type: challengeType,
      question: userData.pregunta,
      hints: userData.pistas || [],
      answerHash,
      salt,
      imagePath: userData.imagePath || null,
      maxAttempts: 5,
      currentAttempts: 0,
      levelId,
      userId,
      completed: false,
      order
    });

    await challenge.save();
    return challenge;
    
  } catch (error) {
    console.error('Error creando reto desde UserData:', error);
    throw error;
  }
};

/**
 * Genera retos a partir de plantillas
 */
const generateChallengesFromTemplates = async (userId, levelId, seed, count = 3) => {
  try {
    // Obtener plantillas activas
    const templates = await ChallengeTemplate.find({ active: true });
    
    if (templates.length === 0) {
      throw new Error('No hay plantillas de retos disponibles');
    }

    // Seleccionar plantillas aleatorias
    const selectedTemplates = selectRandomItems(templates, count, seed);
    
    // Generar retos
    const challenges = [];
    
    for (let i = 0; i < selectedTemplates.length; i++) {
      const template = selectedTemplates[i];
      const challenge = await createChallengeFromTemplate(
        template,
        userId,
        levelId,
        i + 1
      );
      challenges.push(challenge);
    }

    return challenges;
    
  } catch (error) {
    console.error('Error generando retos:', error);
    throw error;
  }
};

/**
 * Crea un reto individual desde una plantilla
 */
const createChallengeFromTemplate = async (template, userId, levelId, order) => {
  try {
    // Obtener valores para las variables
    const variableValues = await getVariableValues(template.variables);
    
    // Reemplazar variables en pregunta y pistas
    const question = replaceVariables(template.questionTemplate, variableValues);
    const hints = template.hintsTemplate.map(hint => 
      replaceVariables(hint, variableValues)
    );

    // Generar respuesta (en este caso, tomar la primera variable como respuesta)
    // Esto debería personalizarse según el tipo de reto
    const answer = variableValues[template.variables[0]] || 'respuesta';
    
    // Generar salt y hash
    const salt = generateSalt();
    const answerHash = hashAnswer(answer, salt);

    // Crear el reto
    const challenge = new Challenge({
      type: template.type,
      question,
      hints,
      answerHash,
      salt,
      imagePath: null, // Se asignará después si es necesario
      maxAttempts: 5,
      currentAttempts: 0,
      levelId,
      userId,
      completed: false,
      order
    });

    await challenge.save();
    return challenge;
    
  } catch (error) {
    console.error('Error creando reto desde plantilla:', error);
    throw error;
  }
};

/**
 * Obtiene valores de variables desde la base de datos
 */
const getVariableValues = async (variableKeys) => {
  const values = {};
  
  for (const key of variableKeys) {
    const variable = await Variable.findOne({ key, active: true });
    if (variable) {
      values[key] = variable.value;
    } else {
      // Valor por defecto si no existe la variable
      values[key] = `[${key}]`;
    }
  }
  
  return values;
};

/**
 * Crea un reto personalizado manualmente
 */
const createCustomChallenge = async (challengeData) => {
  try {
    const { 
      type, 
      question, 
      hints, 
      answer, 
      imagePath,
      userId, 
      levelId,
      order 
    } = challengeData;

    // Generar salt y hash
    const salt = generateSalt();
    const answerHash = hashAnswer(answer, salt);

    const challenge = new Challenge({
      type,
      question,
      hints: hints || [],
      answerHash,
      salt,
      imagePath: imagePath || null,
      maxAttempts: 5,
      currentAttempts: 0,
      levelId,
      userId,
      completed: false,
      order: order || 1
    });

    await challenge.save();
    return challenge;
    
  } catch (error) {
    console.error('Error creando reto personalizado:', error);
    throw error;
  }
};

module.exports = {
  generateChallengesFromTemplates,
  createChallengeFromTemplate,
  createCustomChallenge,
  getVariableValues: getUserDataValues,
  generateChallengesFromUserData,
  createChallengeFromUserData
};