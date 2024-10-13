const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Funkcja do generowania tokenu JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Rejestracja nowego użytkownika
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Walidacja danych wejściowych
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Sprawdzenie, czy użytkownik już istnieje
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Użytkownik o tym adresie email już istnieje.' });
    }

    // Tworzenie nowego użytkownika
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się zarejestrować użytkownika.' });
  }
};

// Logowanie użytkownika
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Walidacja danych wejściowych
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się zalogować.' });
  }
};

// Pobieranie szczegółów użytkownika
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  } else {
    res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
