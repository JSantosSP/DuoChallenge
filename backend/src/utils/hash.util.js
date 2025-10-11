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
 * Normaliza una fecha al formato YYYY-MM-DD
 */
const normalizeDateAnswer = (dateValue) => {
  try {
    // Si es un objeto Date, convertir a ISO string y tomar solo la fecha
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    // Si es string, verificar si ya está en formato YYYY-MM-DD o contiene hora
    const dateStr = dateValue.toString().trim();
    
    // Si contiene 'T' o espacio (tiene hora), tomar solo la parte de la fecha
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    
    // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateStr)) {
      return dateStr;
    }
    
    // Intentar parsear como fecha y normalizar
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    
    // Si no se puede parsear, devolver el valor original
    return dateStr;
  } catch (error) {
    console.error('Error normalizando fecha:', error);
    return dateValue.toString();
  }
};

/**
 * Verifica si una respuesta es correcta
 */
const verifyAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashAnswer(userAnswer, salt);
  return userHash === correctHash;
};

/**
 * Genera hash de una respuesta de tipo fecha
 * Normaliza la fecha a YYYY-MM-DD antes de hashear
 */
const hashDateAnswer = (dateAnswer, salt) => {
  const normalizedDate = normalizeDateAnswer(dateAnswer);
  return crypto
    .createHash('sha256')
    .update(salt + normalizedDate)
    .digest('hex');
};

/**
 * Verifica si una respuesta de tipo fecha es correcta
 */
const verifyDateAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashDateAnswer(userAnswer, salt);
  return userHash === correctHash;
};

module.exports = {
  generateSalt,
  hashAnswer,
  canonicalizeAnswer,
  verifyAnswer,
  normalizeDateAnswer,
  hashDateAnswer,
  verifyDateAnswer
};
