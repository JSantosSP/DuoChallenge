/**
 * @fileoverview Utilidades de Hashing
 * @description Funciones para hashear y verificar respuestas de niveles de forma segura
 */

const crypto = require('crypto');

/**
 * @function generateSalt
 * @description Genera un salt aleatorio de 16 bytes en hexadecimal
 * @returns {string} Salt generado (32 caracteres hex)
 */
const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * @function hashAnswer
 * @description Hashea una respuesta de texto usando SHA-256
 * @param {string} answer - Respuesta a hashear
 * @param {string} salt - Salt para el hash
 * @returns {string} Hash SHA-256 de la respuesta canonicalizada
 */
const hashAnswer = (answer, salt) => {
  const canonical = canonicalizeAnswer(answer);
  return crypto
    .createHash('sha256')
    .update(salt + canonical)
    .digest('hex');
};

/**
 * @function canonicalizeAnswer
 * @description Normaliza una respuesta para comparación consistente
 * - Convierte a minúsculas
 * - Elimina espacios extras
 * - Normaliza caracteres Unicode (elimina acentos)
 * @param {string} answer - Respuesta a canonicalizar
 * @returns {string} Respuesta normalizada
 */
const canonicalizeAnswer = (answer) => {
  return answer
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * @function normalizeDateAnswer
 * @description Normaliza una fecha a formato YYYY-MM-DD
 * @param {Date|string} dateValue - Fecha a normalizar
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
const normalizeDateAnswer = (dateValue) => {
  try {
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    const dateStr = dateValue.toString().trim();
    
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateStr)) {
      return dateStr;
    }
    
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    
    return dateStr;
  } catch (error) {
    console.error('Error normalizando fecha:', error);
    return dateValue.toString();
  }
};

/**
 * @function verifyAnswer
 * @description Verifica si una respuesta de texto es correcta
 * @param {string} userAnswer - Respuesta proporcionada por el usuario
 * @param {string} correctHash - Hash de la respuesta correcta
 * @param {string} salt - Salt usado en el hash
 * @returns {boolean} True si la respuesta es correcta
 */
const verifyAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashAnswer(userAnswer, salt);
  return userHash === correctHash;
};

/**
 * @function hashDateAnswer
 * @description Hashea una respuesta de fecha usando SHA-256
 * @param {Date|string} dateAnswer - Fecha a hashear
 * @param {string} salt - Salt para el hash
 * @returns {string} Hash SHA-256 de la fecha normalizada
 */
const hashDateAnswer = (dateAnswer, salt) => {
  const normalizedDate = normalizeDateAnswer(dateAnswer);
  return crypto
    .createHash('sha256')
    .update(salt + normalizedDate)
    .digest('hex');
};

/**
 * @function verifyDateAnswer
 * @description Verifica si una respuesta de fecha es correcta
 * @param {string} userAnswer - Fecha proporcionada por el usuario
 * @param {string} correctHash - Hash de la fecha correcta
 * @param {string} salt - Salt usado en el hash
 * @returns {boolean} True si la fecha es correcta
 */
const verifyDateAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashDateAnswer(userAnswer, salt);
  return userHash === correctHash;
};

/**
 * @function hashPuzzleAnswer
 * @description Genera el hash del orden correcto de un puzzle
 * @param {number} puzzleGrid - Tamaño de la cuadrícula (ej: 3 = 3x3 = 9 piezas)
 * @param {string} salt - Salt para el hash
 * @returns {string} Hash SHA-256 del orden correcto [1,2,3,...,n]
 */
const hashPuzzleAnswer = (puzzleGrid, salt) => {
  const totalPieces = puzzleGrid * puzzleGrid;
  const correctOrder = Array.from({ length: totalPieces }, (_, i) => i + 1);
  const puzzleString = correctOrder.join(',');
  return crypto
    .createHash('sha256')
    .update(salt + puzzleString)
    .digest('hex');
};

/**
 * @function verifyPuzzleAnswer
 * @description Verifica si el orden del puzzle es correcto
 * @param {number[]} userOrder - Orden proporcionado por el usuario
 * @param {string} correctHash - Hash del orden correcto
 * @param {string} salt - Salt usado en el hash
 * @returns {boolean} True si el orden es correcto
 */
const verifyPuzzleAnswer = (userOrder, correctHash, salt) => {
  if (!Array.isArray(userOrder)) {
    return false;
  }
  const puzzleString = userOrder.join(',');
  const userHash = crypto
    .createHash('sha256')
    .update(salt + puzzleString)
    .digest('hex');
  return userHash === correctHash;
};

module.exports = {
  generateSalt,
  hashAnswer,
  canonicalizeAnswer,
  verifyAnswer,
  normalizeDateAnswer,
  hashDateAnswer,
  verifyDateAnswer,
  hashPuzzleAnswer,
  verifyPuzzleAnswer
};
