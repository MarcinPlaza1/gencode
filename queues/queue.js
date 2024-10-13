// queues/queue.js
const Queue = require('bull');
const { sendPromptToGPT } = require('../utils/openaiService'); // Import funkcji do generowania kodu
const Code = require('../models/codeModel');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');
const crypto = require('crypto');

const generateCodeQueue = new Queue('generateCode', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
  }
});

generateCodeQueue.process(async (job, done) => {
  const { prompt, language, style, framework, detailLevel, context, requirements, aiPrompt } = job.data;

  try {
    // Wysłanie promptu do GPT
    logger.info('Processing prompt in queue for language:', { language });
    const response = await sendPromptToGPT(aiPrompt);

    if (response && response.choices && response.choices.length > 0) {
      const codeContent = response.choices[0].message.content.trim();

      // Sprawdzenie ostatniej wersji
      const lastCode = await Code.findOne({ prompt: prompt.toLowerCase(), language: language.toLowerCase() }).sort({ version: -1 }).lean();
      const version = lastCode ? lastCode.version + 1 : 1;
      const parentId = lastCode ? lastCode._id : null;

      // Zapis nowej wersji kodu do MongoDB
      const newCode = new Code({
        prompt,
        language,
        code: codeContent,
        version,
        parentId,
      });
      await newCode.save();

      // Cache'owanie wyniku
      const cacheKey = crypto.createHash('sha256').update(`${prompt}-${language}`).digest('hex');
      const codeCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
      codeCache.set(cacheKey, codeContent);

      logger.info('Successfully processed job in queue for prompt:', { prompt });
      done(null, newCode); // Zakończ zadanie
    } else {
      throw new Error('Invalid response from GPT');
    }
  } catch (error) {
    logger.error('Błąd podczas przetwarzania zadania w kolejce:', { error: error.message });
    done(error);
  }
});

module.exports = generateCodeQueue;
