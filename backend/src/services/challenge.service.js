const { ChallengeTemplate, Challenge, Variable } = require('../models');
const { generateSalt, hashAnswer } = require('../utils/hash.util');
const { replaceVariables, extractVariables } = require('../utils/template.util');
const { selectRandomItems } = require('../utils/seed.util');

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
  getVariableValues
};