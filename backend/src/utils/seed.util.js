/**
 * @fileoverview Utilidades de Semillas y Aleatoriedad
 * @description Funciones para generación determinista basada en semillas
 */

const crypto = require('crypto');

/**
 * @function generateGameSeed
 * @description Genera una semilla aleatoria única para un juego
 * @returns {string} Semilla de 64 caracteres hexadecimales
 */
const generateGameSeed = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * @function seededRandom
 * @description Genera un número pseudoaleatorio determinista entre 0 y 1
 * @param {string} seed - Semilla base
 * @param {number} index - Índice para generar diferentes valores con la misma semilla
 * @returns {number} Número entre 0 y 1 (determinista)
 */
const seededRandom = (seed, index) => {
  const hash = crypto
    .createHash('sha256')
    .update(seed + index.toString())
    .digest('hex');
  
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
};

/**
 * @function shuffleArray
 * @description Mezcla un array de forma determinista usando una semilla
 * @param {Array} array - Array a mezclar
 * @param {string} seed - Semilla para la mezcla determinista
 * @returns {Array} Nuevo array mezclado (no modifica el original)
 */
const shuffleArray = (array, seed) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * @function selectRandomItems
 * @description Selecciona un número determinado de elementos aleatorios de un array
 * @param {Array} array - Array de elementos
 * @param {number} count - Cantidad de elementos a seleccionar
 * @param {string} seed - Semilla para selección determinista
 * @returns {Array} Array con elementos seleccionados aleatoriamente
 */
const selectRandomItems = (array, count, seed) => {
  const shuffled = shuffleArray(array, seed);
  return shuffled.slice(0, Math.min(count, array.length));
};

module.exports = {
  generateGameSeed,
  seededRandom,
  shuffleArray,
  selectRandomItems
};
