const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const parishCredentialSchema = new mongoose.Schema({
  parish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parish',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

parishCredentialSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

parishCredentialSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('ParishCredential', parishCredentialSchema);