// server.js

// Import required modules
const express = require('express');
const corsConfig = require('./config/corsConfig'); // Włączono CORS z konfiguracją
const connectDB = require('./config/db');
const codeRoutes = require('./routes/codeRoutes');
const authRoutes = require('./routes/authRoutes'); // Import tras autoryzacji
const helmet = require('helmet');
const logger = require('./utils/logger');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');
const csurf = require('csurf');
const path = require('path'); // Nowy import do zarządzania ścieżkami
require('dotenv-safe').config();

// Stwórz instancję aplikacji Express
const app = express();
const PORT = process.env.PORT || 5001;
// Inicjalizacja middleware CSRF
const csrfProtection = csurf({ cookie: true });

// Middleware setup
logger.info('Configuring CORS settings...');
app.use(corsConfig); // Korzystanie z konfiguracji CORS
logger.info('Setting up JSON parsing middleware for all routes...');
app.use(express.json());
logger.info('Applying security headers using Helmet...');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  xssFilter: true, // Ochrona przed XSS
}));

// Middleware setup
app.use(csrfProtection); // Ochrona przed CSRF
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken()); // Wysyłanie tokenu CSRF do klienta
  next();
});

// Rate limiting middleware
logger.info('Applying rate limiting to all routes...');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs, configurable via env
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Database connection with retry logic
logger.info('Connecting to the database...');
let connectionAttempts = 0;
const maxRetries = 10;
const retryDelay = process.env.DB_RETRY_DELAY || 10000; // Delay increased to 10 seconds

const connectWithRetry = () => {
  connectDB()
    .then(() => {
      logger.info('Successfully connected to the database');
    })
    .catch((error) => {
      connectionAttempts++;
      if (connectionAttempts >= maxRetries) {
        logger.error('Max retries reached. Exiting...');
        process.exit(1);
      } else {
        logger.error(`Database connection failed. Retrying in ${retryDelay / 1000} seconds...`, error);
        setTimeout(connectWithRetry, retryDelay);
      }
    });
};
connectWithRetry();

// Apply routes with versioning
logger.info('Setting up routes for /api/v1/code...');
app.use('/api/v1/code', codeRoutes);

logger.info('Setting up routes for /api/v1/auth...'); // Logowanie tras autoryzacji
app.use('/api/v1/auth', authRoutes); // Dodano trasy autoryzacyjne

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler for HTTP server
const shutdown = () => {
  logger.info('Shutting down server gracefully...');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });

  // Force shutdown if not finished in time
  setTimeout(() => {
    logger.error('Forcing server shutdown due to delay.');
    process.exit(1);
  }, 15000); // 15 seconds (zwiększony czas)
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server only if not in testing environment
let server = null;
if (require.main === module) {
  server = app.listen(PORT, (error) => {
    if (error) {
      logger.error('Failed to start the server:', error);
      process.exit(1);
    } else {
      logger.info(`Server is running on port ${PORT}`);
    }
  });
}

module.exports = { app, server };
