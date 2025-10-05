const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['date', 'text', 'location', 'number'],
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Variable', variableSchema);