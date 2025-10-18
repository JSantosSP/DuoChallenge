const mongoose = require('mongoose');

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