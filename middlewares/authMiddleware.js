const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Dekodowanie tokenu
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Znalezienie użytkownika na podstawie tokenu
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Nieautoryzowany, token jest nieprawidłowy.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Brak autoryzacji, brak tokenu.' });
  }
};

module.exports = authMiddleware;
