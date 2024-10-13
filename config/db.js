const mongoose = require('mongoose');
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path'); // Import do zarządzania ścieżkami

// Ustawienie loggera z rotacją logów do folderu logs
const logger = require('../utils/logger');

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Funkcja łączenia z bazą danych MongoDB (bez przestarzałych opcji)
const connectDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Database connection error:', error);
    gracefulShutdown();
  }
};

// Funkcja łagodnego zamknięcia aplikacji
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed. Exiting now.');
    process.exit(1);
  } catch (error) {
    logger.error('Error while closing MongoDB connection:', error);
    process.exit(1);
  }

  // Wymuszone zamknięcie, jeśli połączenia nie zostaną zamknięte w odpowiednim czasie
  setTimeout(() => {
    logger.error('Forcing shutdown as some connections did not close in time.');
    process.exit(1);
  }, 10000);
};

module.exports = connectDB;