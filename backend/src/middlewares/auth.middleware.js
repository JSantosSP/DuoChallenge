/**
 * @fileoverview Middlewares de Autenticación
 * @description Middlewares para verificar tokens JWT y validar roles
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @function verifyToken
 * @async
 * @description Middleware que verifica el token JWT en el header Authorization
 * @param {Object} req.headers.authorization - Token en formato "Bearer {token}"
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Callback de siguiente middleware
 * @returns {void} Llama a next() si el token es válido, o retorna 401
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
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

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
 * @function checkRole
 * @description Factory que crea un middleware para verificar roles de usuario
 * @param {...string} roles - Lista de roles permitidos
 * @returns {Function} Middleware que verifica si el usuario tiene alguno de los roles
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
 * @function optionalAuth
 * @async
 * @description Middleware que verifica el token JWT si está presente, pero no falla si no lo está
 * @param {Object} req.headers.authorization - Token en formato "Bearer {token}" (opcional)
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Callback de siguiente middleware
 * @returns {void} Siempre llama a next()
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
  }
  
  next();
};

module.exports = {
  verifyToken,
  checkRole,
  optionalAuth
};