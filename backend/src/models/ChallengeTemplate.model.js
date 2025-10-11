const mongoose = require('mongoose');

const challengeTemplateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'date', 'photo'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  questionTemplate: {
    type: String,
    required: true
  },
  variables: [{
    type: String
  }],
  hintsTemplate: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'general'
  },
  answerExample: {
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

module.exports = mongoose.model('ChallengeTemplate', challengeTemplateSchema);