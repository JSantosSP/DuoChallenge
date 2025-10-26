/**
 * @fileoverview Modelo de Usuario
 * @description Define el esquema y métodos del usuario del sistema
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @typedef {Object} UserSchema
 * @property {string} name - Nombre completo del usuario
 * @property {string} email - Email único del usuario (usado para autenticación)
 * @property {string} passwordHash - Hash de la contraseña del usuario
 * @property {string} role - Rol del usuario: 'admin' o 'player'
 * @property {number} totalSetsCompleted - Cantidad total de sets de juego completados
 * @property {Date} createdAt - Fecha de creación (generado automáticamente)
 * @property {Date} updatedAt - Fecha de última actualización (generado automáticamente)
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'player'],
    default: 'player'
  },
  totalSetsCompleted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * @method pre('save')
 * @description Hook que se ejecuta antes de guardar el usuario
 * - Hashea la contraseña si fue modificada
 * @param {Function} next - Callback de Mongoose
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') && !this.isNew) return next();
  
  if (!this.roles || this.roles.length === 0) {
    this.roles = [this.role];
  }
  
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  
  next();
});

/**
 * @method comparePassword
 * @async
 * @description Compara una contraseña candidata con el hash almacenado
 * @param {string} candidatePassword - Contraseña a verificar
 * @returns {Promise<boolean>} True si la contraseña es correcta
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * @method toJSON
 * @description Serializa el usuario a JSON excluyendo campos sensibles
 * @returns {Object} Usuario sin el campo passwordHash
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

/**
 * @method hasRole
 * @description Verifica si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar
 * @returns {boolean} True si el usuario tiene el rol
 */
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

module.exports = mongoose.model('User', userSchema);
