/**
 * @fileoverview Modelo de Datos de Usuario
 * @description Almacena los datos personalizados que crea cada usuario para generar niveles
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} UserDataSchema
 * @property {ObjectId} userId - ID del usuario propietario
 * @property {ObjectId} tipoDato - ID del tipo de variable (foto, fecha, lugar, texto)
 * @property {Object} valor - Objeto que contiene la respuesta del nivel
 * @property {string} pregunta - Pregunta que se mostrará en el nivel
 * @property {string[]} pistas - Array de pistas que se mostrarán en intentos fallidos
 * @property {ObjectId} categorias - ID de la categoría a la que pertenece
 * @property {string} imagePath - Ruta de la imagen asociada (para tipo 'foto')
 * @property {number} puzzleGrid - Tamaño de la cuadrícula del puzzle (2-5, default: 3)
 * @property {string} difficulty - Dificultad: 'easy', 'medium', 'hard'
 * @property {boolean} active - Indica si el dato está activo
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const userDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipoDato: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variable',
    required: true
  },
  valor: {
    type: Object,
    required: true
  },
  pregunta: {
    type: String,
    required: true
  },
  pistas: [{
    type: String
  }],
  categorias: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  imagePath: {
    type: String,
    default: null
  },
  puzzleGrid: {
    type: Number,
    default: 3,
    min: 2,
    max: 5
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userDataSchema.index({ userId: 1, tipoDato: 1 });

module.exports = mongoose.model('UserData', userDataSchema);
