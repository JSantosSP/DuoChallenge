const mongoose = require('mongoose');

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
    default: 3, // 3x3 por defecto para retos de foto
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

// Índice para búsquedas rápidas
userDataSchema.index({ userId: 1, tipoDato: 1 });

module.exports = mongoose.model('UserData', userDataSchema);