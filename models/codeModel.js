const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true, // Usunięcie zbędnych spacji
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Code',
    default: null,
  },
  context: String,
  requirements: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Dodano indeks na polach prompt i language dla szybszych zapytań
codeSchema.index({ prompt: 1, language: 1 });

module.exports = mongoose.model('Code', codeSchema);
