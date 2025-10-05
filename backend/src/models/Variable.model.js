const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['date', 'text', 'location', 'number', 'image'],
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  description: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  // Ya NO almacena el valor, solo define el tipo de dato
  isSystemVariable: {
    type: Boolean,
    default: true // true = creada por admin, false = definida por usuario
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Variable', variableSchema);