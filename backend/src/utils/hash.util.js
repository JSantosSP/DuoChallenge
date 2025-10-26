const crypto = require('crypto');

const generateSalt = () => {
  return crypto.randomBytes(16).toString('hex');
};

const hashAnswer = (answer, salt) => {
  const canonical = canonicalizeAnswer(answer);
  return crypto
    .createHash('sha256')
    .update(salt + canonical)
    .digest('hex');
};

const canonicalizeAnswer = (answer) => {
  return answer
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

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

const verifyAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashAnswer(userAnswer, salt);
  return userHash === correctHash;
};

const hashDateAnswer = (dateAnswer, salt) => {
  const normalizedDate = normalizeDateAnswer(dateAnswer);
  return crypto
    .createHash('sha256')
    .update(salt + normalizedDate)
    .digest('hex');
};

const verifyDateAnswer = (userAnswer, correctHash, salt) => {
  const userHash = hashDateAnswer(userAnswer, salt);
  return userHash === correctHash;
};

const hashPuzzleAnswer = (puzzleGrid, salt) => {
  const totalPieces = puzzleGrid * puzzleGrid;
  const correctOrder = Array.from({ length: totalPieces }, (_, i) => i + 1);
  const puzzleString = correctOrder.join(',');
  return crypto
    .createHash('sha256')
    .update(salt + puzzleString)
    .digest('hex');
};

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
