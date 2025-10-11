const mongoose = require('mongoose');

const levelTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  dataType: {
    type: String,
    required: true,
    // Tipos de dato que pueden usar los usuarios: nombre, foto, fecha, lugar, etc.
    enum: ['nombre', 'foto', 'fecha', 'lugar', 'texto', 'numero', 'telefono', 'email', 'otro']
  },
  challengesPerLevel: {
    type: Number,
    required: true,
    default: 3,
    min: 1,
    max: 10
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  order: {
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

// Índice compuesto para búsquedas eficientes
levelTemplateSchema.index({ categoryId: 1, dataType: 1 });
levelTemplateSchema.index({ active: 1, order: 1 });

module.exports = mongoose.model('LevelTemplate', levelTemplateSchema);
