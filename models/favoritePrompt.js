const mongoose = require('mongoose');

const favoritePromptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  prompt: { type: String, required: true },
});

module.exports = mongoose.model('FavoritePrompt', favoritePromptSchema);
