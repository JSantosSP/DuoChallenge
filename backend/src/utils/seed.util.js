const crypto = require('crypto');

/**
 * Genera un seed único para un set de juego
 */
const generateGameSeed = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Genera un número aleatorio basado en seed (reproducible)
 */
const seededRandom = (seed, index) => {
  const hash = crypto
    .createHash('sha256')
    .update(seed + index.toString())
    .digest('hex');
  
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
};

/**
 * Mezcla un array usando seed (Fisher-Yates seeded)
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
 * Selecciona elementos aleatorios de un array
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