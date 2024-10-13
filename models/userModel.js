const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const codeHistorySchema = new mongoose.Schema({
  prompt: String,
  language: String,
  code: String,
  version: Number,
  label: String, // Etykieta, np. "wersja finalna"
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },
  codeHistory: [codeHistorySchema], // Przechowywanie historii kodu
}, { timestamps: true });

// Hashowanie hasła przed zapisem
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Porównywanie hasła
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
