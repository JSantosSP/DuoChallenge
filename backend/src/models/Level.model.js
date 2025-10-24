const mongoose = require('mongoose');

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
    default: 3, // 3x3 por defecto para retos de foto
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