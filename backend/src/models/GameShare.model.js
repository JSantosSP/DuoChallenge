const mongoose = require('mongoose');

const gameShareSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  active: {
    type: Boolean,
    default: true
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxUses: {
    type: Number,
    default: null // null = ilimitado
  },
  expiresAt: {
    type: Date,
    default: null // null = no expira
  }
}, {
  timestamps: true
});

// Índices
gameShareSchema.index({ code: 1 });
gameShareSchema.index({ creatorId: 1, active: 1 });

module.exports = mongoose.model('GameShare', gameShareSchema);