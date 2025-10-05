const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipoDato: {
    type: String,
    required: true,
    // Hace referencia a Variable.key
  },
  valor: {
    type: String,
    required: true
  },
  pregunta: {
    type: String,
    required: true
  },
  pistas: [{
    type: String
  }],
  categorias: [{
    type: String
  }],
  imagePath: {
    type: String,
    default: null
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