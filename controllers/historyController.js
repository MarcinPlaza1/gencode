// controllers/historyController.js
const redis = require('../utils/redisClient');
const Code = require('../models/codeModel');
const PromptHistory = require('../models/promptHistory');
const logger = require('../utils/logger');

// Funkcja do pobierania historii z Redis
const getHistory = async (req, res) => {
  const cacheKey = 'code_history';

  try {
    const cachedHistory = await redis.get(cacheKey);
    if (cachedHistory) {
      logger.info('Serving cached history from Redis');
      return res.json(JSON.parse(cachedHistory));
    }

    logger.info('Fetching code history from MongoDB...');
    const { page = 1, limit = 10 } = req.query;
    const codes = await Code.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    redis.set(cacheKey, JSON.stringify(codes), 'EX', 300); // Cache na 5 minut
    res.json(codes);
  } catch (error) {
    logger.error('Błąd podczas pobierania historii:', { error: error.message });
    res.status(500).json({ error: 'Błąd podczas pobierania historii.' });
  }
};

// Pobierz historię promptów użytkownika
const getPromptHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await PromptHistory.find({ userId }).sort({ createdAt: -1 }).limit(10);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania historii promptów.' });
  }
};

// Zapisz prompt do historii
const savePromptHistory = async (userId, prompt) => {
  const history = new PromptHistory({ userId, prompt });
  await history.save();
};

module.exports = {
  getHistory,
  getPromptHistory,
  savePromptHistory,
};
