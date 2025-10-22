const mongoose = require('mongoose');

const gameInstanceSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareCode: {
    type: String,
    required: true
  },
  currentSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSet',
    default: null
  },
  completedSets: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  completedLevels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  currentPrizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null
  }
}, {
  timestamps: true
});

// Índices
gameInstanceSchema.index({ playerId: 1, active: 1 });
gameInstanceSchema.index({ creatorId: 1 });

module.exports = mongoose.model('GameInstance', gameInstanceSchema);