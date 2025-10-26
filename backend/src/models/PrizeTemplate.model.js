const mongoose = require('mongoose');

const prizeTemplateSchema = new mongoose.Schema({
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

prizeTemplateSchema.index({ userId: 1, active: 1 });
prizeTemplateSchema.index({ isDefault: 1, active: 1 });

module.exports = mongoose.model('PrizeTemplate', prizeTemplateSchema);