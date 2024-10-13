const mongoose = require('mongoose');

const promptHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  prompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PromptHistory', promptHistorySchema);
