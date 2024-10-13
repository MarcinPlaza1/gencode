const rateLimit = require('express-rate-limit');

const userRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each user to 100 requests per hour
  keyGenerator: (req) => req.user.id || req.ip, // Based on user ID or IP
  handler: (req, res) => {
    return res.status(429).json({ error: 'Przekroczyłeś limit zapytań. Spróbuj ponownie za godzinę.' });
  }
});

module.exports = userRateLimiter;
