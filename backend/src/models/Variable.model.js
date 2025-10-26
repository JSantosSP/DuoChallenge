/**
 * @fileoverview Modelo de Variable (Tipo de Dato)
 * @description Define los tipos de datos que pueden ser usados en los niveles: foto, fecha, lugar, texto
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} VariableSchema
 * @property {string} type - Tipo de dato: 'foto', 'fecha', 'lugar', 'texto'
 * @property {boolean} active - Indica si el tipo está activo
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const variableSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['foto', 'fecha', 'lugar', 'texto'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Variable', variableSchema);
