/**
 * @fileoverview Modelo de Plantilla de Premio
 * @description Plantilla predefinida de premios que pueden ser usadas como referencia
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} PrizeTemplateSchema
 * @property {string} title - Título de la plantilla de premio
 * @property {string} description - Descripción del premio
 * @property {string} imagePath - Ruta de la imagen del premio
 * @property {number} weight - Peso para selección aleatoria (1-10)
 * @property {boolean} active - Indica si la plantilla está activa
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const prizeTemplateSchema = new mongoose.Schema({
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

prizeTemplateSchema.index({ userId: 1, active: 1 });
prizeTemplateSchema.index({ isDefault: 1, active: 1 });

module.exports = mongoose.model('PrizeTemplate', prizeTemplateSchema);
