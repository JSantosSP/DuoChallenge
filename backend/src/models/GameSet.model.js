/**
 * @fileoverview Modelo de Set de Juego
 * @description Representa un juego completo con múltiples niveles que un usuario debe completar
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} GameSetSchema
 * @property {ObjectId} userId - ID del usuario que juega este set
 * @property {ObjectId} creatorId - ID del usuario que creó los datos usados en este set
 * @property {ObjectId} shareId - ID del GameShare si el juego proviene de un código compartido
 * @property {string} shareCode - Código de compartir usado (si aplica)
 * @property {ObjectId[]} levels - Array de IDs de niveles que componen el juego
 * @property {string} seed - Semilla aleatoria usada para generar el set
 * @property {ObjectId} prizeId - ID del premio asignado al completar el set
 * @property {string} status - Estado: 'active', 'completed', 'abandoned'
 * @property {Date} startedAt - Fecha de inicio del juego
 * @property {Date} completedAt - Fecha de completitud del juego
 * @property {ObjectId[]} completedLevels - Array de IDs de niveles completados
 * @property {number} totalLevels - Cantidad total de niveles en el set
 * @property {number} progress - Porcentaje de progreso (0-100)
 * @property {boolean} active - Indica si el set está activo
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const gameSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameShare',
    default: null
  },
  shareCode: {
    type: String,
    default: null
  },
  levels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  seed: {
    type: String,
    required: true
  },
  prizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedLevels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  totalLevels: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

gameSetSchema.index({ userId: 1, status: 1 });
gameSetSchema.index({ creatorId: 1 });
gameSetSchema.index({ shareId: 1 });

module.exports = mongoose.model('GameSet', gameSetSchema);
