const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para verificar JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Token inválido' 
    });
  }
};
/**
 * Middleware para verificar rol de admin
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'No autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'No tienes permisos para esta acción' 
      });
    }

    next();
  };
};

/**
 * Middleware opcional de verificación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // No hacer nada, continuar sin usuario
  }
  
  next();
};

module.exports = {
  verifyToken,
  checkRole,
  optionalAuth
};