// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Błąd walidacji danych.' });
    }
  
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Brak autoryzacji.' });
    }
  
    if (err.name === 'MongoNetworkError') {
      return res.status(503).json({ error: 'Brak połączenia z bazą danych.' });
    }
  
    return res.status(500).json({ error: 'Wystąpił błąd wewnętrzny serwera.' });
  };
  
  module.exports = errorHandler;
  