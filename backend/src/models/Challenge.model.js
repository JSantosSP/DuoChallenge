const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'date', 'photo'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  hints: [{
    type: String
  }],
  answerHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    default: null
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  currentAttempts: {
    type: Number,
    default: 0
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);