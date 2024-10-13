const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check } = require('express-validator');
const router = express.Router();

// Rejestracja nowego użytkownika
router.post(
  '/register',
  [
    check('name', 'Imię jest wymagane').not().isEmpty(),
    check('email', 'Podaj poprawny email').isEmail(),
    check('password', 'Hasło musi mieć co najmniej 6 znaków').isLength({ min: 6 })
  ],
  registerUser
);

// Logowanie użytkownika
router.post(
  '/login',
  [
    check('email', 'Podaj poprawny email').isEmail(),
    check('password', 'Hasło jest wymagane').exists()
  ],
  loginUser
);

// Profil użytkownika (chroniony przez middleware autoryzacyjny)
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
