const express = require('express');
const { generateCode, runCode, checkSyntax, lintCode, runUnitTests } = require('../controllers/codeController');
const { getDefaultPrompts, getPromptTemplates, generateCodeFromTemplate, saveFavoritePrompt, getFavoritePrompts } = require('../controllers/promptController');
const { getHistory, getPromptHistory } = require('../controllers/historyController');
const validateInput = require('../middlewares/validateInput');
const userRateLimiter = require('../middlewares/userRateLimiter');
const authMiddleware = require('../middlewares/authMiddleware'); // Import middleware autoryzacyjnego
const accessControl = require('../middlewares/accessControl');

const router = express.Router();

// Trasy związane z kodem
router.post('/generate-code', authMiddleware, userRateLimiter, validateInput, generateCode); // Można opcjonalnie dodać authMiddleware, jeśli chcesz, aby tylko zalogowani użytkownicy generowali kod
router.post('/run-code', runCode);
router.post('/check-syntax', checkSyntax);
router.post('/lint-code', lintCode);
router.post('/run-tests', runUnitTests);

// Trasy związane z promptami
router.get('/prompts/default', getDefaultPrompts);
router.get('/prompts/templates', getPromptTemplates);
router.post('/generate-code/template', generateCodeFromTemplate);

// Trasy związane z ulubionymi promptami i historią (zabezpieczone autoryzacją)
router.post('/prompts/favorite', authMiddleware, saveFavoritePrompt); // Zabezpieczone autoryzacją
router.get('/prompts/favorites', authMiddleware, getFavoritePrompts); // Zabezpieczone autoryzacją
router.get('/prompts/history', authMiddleware, getPromptHistory); // Zabezpieczone autoryzacją
router.get('/history', authMiddleware, getHistory); // Zabezpieczone autoryzacją

module.exports = router;
