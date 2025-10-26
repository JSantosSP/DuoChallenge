/**
 * @fileoverview Modelo de Compartir Juego
 * @description Gestiona códigos compartidos para que otros usuarios jueguen con los datos personalizados del creador
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} GameShareSchema
 * @property {ObjectId} creatorId - ID del usuario que crea el código
 * @property {string} code - Código único de 6 caracteres alfanuméricos
 * @property {boolean} active - Indica si el código está activo
 * @property {Array<{userId: ObjectId, joinedAt: Date}>} usedBy - Array de usuarios que usaron el código
 * @property {number} maxUses - Número máximo de usos permitidos (null = ilimitado)
 * @property {Date} expiresAt - Fecha de expiración del código (null = sin expiración)
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const gameShareSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  active: {
    type: Boolean,
    default: true
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxUses: {
    type: Number,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

gameShareSchema.index({ code: 1 });
gameShareSchema.index({ creatorId: 1, active: 1 });

module.exports = mongoose.model('GameShare', gameShareSchema);
