/**
 * @fileoverview Modelo de Premio
 * @description Premio personalizado creado por un usuario para ser asignado al completar un GameSet
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} PrizeSchema
 * @property {ObjectId} userId - ID del usuario propietario del premio
 * @property {string} title - Título del premio
 * @property {string} description - Descripción detallada del premio
 * @property {string} imagePath - Ruta de la imagen del premio
 * @property {boolean} used - Indica si el premio ya fue usado/ganado
 * @property {ObjectId} usedBy - ID del usuario que ganó el premio
 * @property {Date} usedAt - Fecha en que fue usado/ganado
 * @property {number} weight - Peso para selección aleatoria ponderada (1-10)
 * @property {boolean} active - Indica si el premio está activo
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const prizeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    default: null
  },
  used: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  weight: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

prizeSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('Prize', prizeSchema);
