// utils/cacheUtils.js
const redis = require('./redisClient'); // Zakładając, że masz Redis jako mechanizm cache

// Funkcja do generowania klucza cache z dodatkowych parametrów
const generateCacheKey = (prompt, language, style, framework, detailLevel, context) => {
  return `${prompt}-${language}-${style || ''}-${framework || ''}-${detailLevel || ''}-${context || ''}`;
};

// Funkcja do ustawiania wartości w Redis cache
const setCache = (key, value, ttl = 300) => {
  return redis.set(key, JSON.stringify(value), 'EX', ttl); // 300 sekund TTL (5 minut)
};

// Funkcja do pobierania wartości z Redis cache
const getCache = async (key) => {
  const cachedValue = await redis.get(key);
  return cachedValue ? JSON.parse(cachedValue) : null;
};

module.exports = {
  generateCacheKey,
  setCache,
  getCache,
};
