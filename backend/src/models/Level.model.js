/**
 * @fileoverview Modelo de Nivel
 * @description Representa un nivel/desafío individual dentro de un GameSet
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} LevelSchema
 * @property {ObjectId} gameSetId - ID del GameSet al que pertenece
 * @property {ObjectId} categoryId - ID de la categoría del nivel
 * @property {ObjectId} tipoDato - ID del tipo de dato (Variable)
 * @property {string} difficulty - Dificultad: 'easy', 'medium', 'hard'
 * @property {number} order - Orden del nivel dentro del set
 * @property {number} currentAttempts - Intentos actuales realizados
 * @property {number} maxAttempts - Máximo de intentos permitidos
 * @property {boolean} completed - Indica si el nivel fue completado
 * @property {Date} completedAt - Fecha de completitud
 * @property {Object} valor - Objeto que contiene el hash y salt de la respuesta
 * @property {string} pregunta - Pregunta del nivel
 * @property {string[]} pistas - Array de pistas
 * @property {number} puzzleGrid - Tamaño de cuadrícula para puzzles (2-5)
 * @property {string} imagePath - Ruta de la imagen (para niveles tipo 'foto')
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const levelSchema = new mongoose.Schema({
  gameSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSet',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tipoDato: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variable',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },  
  currentAttempts:{
    type: Number,
    default: 0  
  },
  maxAttempts:{
    type: Number,
    default: 5
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
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
  puzzleGrid: {
    type: Number,
    default: 3,
    min: 2,
    max: 5
  },
  imagePath: {
    type: String,
    default: null
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Level', levelSchema);
