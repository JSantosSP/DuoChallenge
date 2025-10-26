const crypto = require('crypto');

const generateGameSeed = () => {
  return crypto.randomBytes(32).toString('hex');
};

const seededRandom = (seed, index) => {
  const hash = crypto
    .createHash('sha256')
    .update(seed + index.toString())
    .digest('hex');
  
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
};

const shuffleArray = (array, seed) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

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