/**
 * @fileoverview Controlador de Autenticación
 * @description Gestiona registro, login, refresh de tokens y perfil de usuario
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @function register
 * @async
 * @description Registra un nuevo usuario en el sistema
 * @param {Object} req.body - Datos del usuario
 * @param {string} req.body.name - Nombre del usuario
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {string} [req.body.role='player'] - Rol del usuario
 * @returns {Object} 201 - Usuario creado con tokens JWT
 * @returns {Object} 400 - Error de validación o email duplicado
 * @returns {Object} 500 - Error del servidor
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      role: role || 'player'
    });

    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * @function login
 * @async
 * @description Autentica un usuario y genera tokens JWT
 * @param {Object} req.body - Credenciales del usuario
 * @param {string} req.body.email - Email del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @returns {Object} 200 - Login exitoso con tokens JWT
 * @returns {Object} 400 - Faltan credenciales
 * @returns {Object} 401 - Credenciales inválidas
 * @returns {Object} 500 - Error del servidor
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * @function refreshToken
 * @async
 * @description Genera nuevos tokens JWT usando un refresh token válido
 * @param {Object} req.body - Datos del refresh
 * @param {string} req.body.refreshToken - Refresh token JWT
 * @returns {Object} 200 - Nuevos tokens generados
 * @returns {Object} 400 - Refresh token no proporcionado
 * @returns {Object} 401 - Refresh token inválido o expirado
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * @function getProfile
 * @async
 * @description Obtiene el perfil del usuario autenticado
 * @param {Object} req.user - Usuario autenticado (inyectado por middleware)
 * @returns {Object} 200 - Datos del perfil del usuario
 * @returns {Object} 500 - Error del servidor
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('currentSetId')
      .populate('currentPrizeId');

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo perfil',
      error: error.message
    });
  }
};

/**
 * @function generateToken
 * @description Genera un JWT de acceso con duración de 24 horas
 * @param {string} userId - ID del usuario
 * @returns {string} Token JWT firmado
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * @function generateRefreshToken
 * @description Genera un refresh token JWT con duración de 7 días
 * @param {string} userId - ID del usuario
 * @returns {string} Refresh token JWT firmado
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile
};