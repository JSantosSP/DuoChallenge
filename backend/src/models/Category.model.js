/**
 * @fileoverview Modelo de Categoría
 * @description Define categorías para clasificar los datos del usuario (ej: Fechas Especiales, Lugares, etc.)
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} CategorySchema
 * @property {string} name - Nombre único de la categoría
 * @property {string} description - Descripción de qué tipo de datos contiene
 * @property {boolean} active - Indica si la categoría está activa
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
