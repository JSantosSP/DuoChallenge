const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  },
  currentSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSet',
    default: null
  },
  completedChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  }],
  completedLevels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  currentPrizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null
  },
  totalSetsCompleted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Método para hashear password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Método para obtener usuario sin password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);