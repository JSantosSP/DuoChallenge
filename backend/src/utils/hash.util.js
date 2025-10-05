const crypto = require('crypto');

/**
 * Genera un salt aleatorio
 */
const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Genera un hash SHA256 de una respuesta + salt
 */
const hashAnswer = (answer, salt) => {
  const canonical = canonicalizeAnswer(answer);
  return crypto
    .createHash('sha256')
    .update(salt + canonical)
    .digest('hex');
};

/**
 * Canonicaliza una respuesta (minúsculas, sin espacios extra, etc.)
 */
const canonicalizeAnswer = (answer) => {
  return answer
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Elimina acentos
};

/**
 * Verifica si una respuesta es correcta
 */
const verifyAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashAnswer(userAnswer, salt);
  return userHash === correctHash;
};

module.exports = {
  generateSalt,
  hashAnswer,
  canonicalizeAnswer,
  verifyAnswer
};
