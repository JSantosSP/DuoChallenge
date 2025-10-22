const mongoose = require('mongoose');

const gameSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameShare',
    default: null
  },
  shareCode: {
    type: String,
    default: null
  },
  levels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  seed: {
    type: String,
    required: true
  },
  prizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedLevels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  totalLevels: {
    type: Number,
    default: 0
  },
  progress: {
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

gameSetSchema.index({ userId: 1, status: 1 });
gameSetSchema.index({ creatorId: 1 });
gameSetSchema.index({ shareId: 1 });

module.exports = mongoose.model('GameSet', gameSetSchema);