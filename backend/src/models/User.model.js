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
    enum: ['admin', 'creator', 'player'],
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
  },
  activeGameInstances: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameInstance'
  }]
}, {
  timestamps: true
});

// Pre-save para sincronizar roles
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') && !this.isNew) return next();
  
  // Sincronizar role con roles array
  if (!this.roles || this.roles.length === 0) {
    this.roles = [this.role];
  }
  
  // Hash password si es nuevo o modificado
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

// NUEVO: Método para verificar si tiene un rol
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

module.exports = mongoose.model('User', userSchema);