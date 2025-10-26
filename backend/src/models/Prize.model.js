const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    default: null
  },
  used: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  weight: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

prizeSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('Prize', prizeSchema);