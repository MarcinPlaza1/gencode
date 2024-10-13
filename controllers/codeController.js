const { generateCacheKey, setCache, getCache } = require('../utils/cacheUtils');
const generateCodeQueue = require('../queues/queue');
const logger = require('../utils/logger');
const axiosInstance = require('../utils/axiosInstance');
const { exec } = require('child_process');
const fs = require('fs');
const User = require('../models/userModel'); // Dodanie modelu użytkownika

// Funkcja do generowania kodu i zapisywania na koncie użytkownika
const generateCode = async (req, res) => {
  const { prompt, language, style, framework, detailLevel, context, requirements, label } = req.body;

  if (!['Python', 'JavaScript', 'Java', 'C#', 'C++', 'Ruby', 'Go', 'Rust', 'PHP', 'TypeScript', 'Swift', 'Kotlin', 'R', 'Scala', 'Perl'].includes(language)) {
    return res.status(400).json({ error: 'Unsupported programming language.' });
  }

  const aiPrompt = generatePrompt({
    appType: 'aplikację',
    technologies: [language, style, framework].filter(Boolean),
    features: [detailLevel, context, requirements].filter(Boolean),
    userInput: prompt
  });

  const cacheKey = generateCacheKey(prompt, language, style, framework, detailLevel, context);
  const cachedCode = await getCache(cacheKey);

  if (cachedCode) {
    logger.info('Serving cached code for prompt:', { prompt });
    return res.json({ code: cachedCode });
  }

  try {
    // Wygenerowanie kodu za pomocą kolejki
    const generatedCode = await generateCodeQueue.add({
      prompt, language, style, framework, detailLevel, context, requirements, aiPrompt
    });

    // Dodaj historię kodu do konta użytkownika
    const user = await User.findById(req.user.id);
    const newVersion = user.codeHistory.length + 1;

    user.codeHistory.push({
      prompt,
      language,
      code: generatedCode, 
      version: newVersion,
      label: label || 'Wersja robocza'
    });

    await user.save();

    logger.info('Kod wygenerowany i zapisany do historii użytkownika');
    res.json({ message: 'Kod wygenerowany i zapisany do historii.', code: generatedCode });
  } catch (error) {
    logger.error('Błąd podczas generowania kodu:', { error: error.message });
    res.status(500).json({ error: 'Nie udało się wygenerować kodu.' });
  }
};

// Funkcja do pobierania historii kodu użytkownika
const getCodeHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.codeHistory);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać historii kodu.' });
  }
};

// Funkcja do uruchamiania kodu
const runCode = async (req, res) => {
  const { code, language } = req.body;

  try {
    logger.info('Sending request to run code in language:', { language });
    const response = await axiosInstance.post('https://emkc.org/api/v2/piston/execute', {
      language: language.toLowerCase(),
      source: code,
    }, { timeout: 15000 });
    logger.info('Received response from code execution API', { responseData: response.data });
    res.json({ output: response.data.output });
  } catch (error) {
    logger.error('Błąd podczas uruchamiania kodu:', { error: error.message });
    res.status(500).json({ error: 'Błąd podczas uruchamiania kodu.' });
  }
};

// Funkcja do weryfikacji kodu pod kątem błędów składniowych
const checkSyntax = async (req, res) => {
  const { code, language } = req.body;

  try {
    logger.info('Sprawdzanie składni dla języka:', { language });
    const response = await axiosInstance.post('https://emkc.org/api/v2/piston/execute', {
      language: language.toLowerCase(),
      source: code,
    });

    if (response.data.output.includes('Error')) {
      logger.error('Błąd składni w kodzie:', { output: response.data.output });
      return res.status(400).json({ error: 'Kod zawiera błędy składniowe.', details: response.data.output });
    }

    res.json({ message: 'Kod jest poprawny składniowo.', output: response.data.output });
  } catch (error) {
    logger.error('Błąd podczas weryfikacji składni:', { error: error.message });
    res.status(500).json({ error: 'Nie udało się zweryfikować składni kodu.' });
  }
};

// Funkcja do lintingu kodu JavaScript
const lintCode = async (req, res) => {
  const { code, language } = req.body;

  if (language.toLowerCase() !== 'javascript') {
    return res.status(400).json({ error: 'Linting dostępny tylko dla JavaScript.' });
  }

  try {
    // Zapisz kod tymczasowo do pliku
    const tempFilePath = './temp.js';
    fs.writeFileSync(tempFilePath, code);

    // Uruchom ESLint na tym pliku
    exec(`eslint ${tempFilePath} --format json`, (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd podczas lintingu kodu.' });
      }

      const lintResults = JSON.parse(stdout);
      res.json({ lintResults });
    });
  } catch (error) {
    logger.error('Błąd podczas lintingu kodu:', { error: error.message });
    res.status(500).json({ error: 'Nie udało się wykonać lintingu.' });
  }
};

// Funkcja do generowania i uruchamiania testów jednostkowych
const runUnitTests = async (req, res) => {
  const { code, language } = req.body;

  if (language.toLowerCase() !== 'javascript') {
    return res.status(400).json({ error: 'Testowanie jednostkowe dostępne tylko dla JavaScript.' });
  }

  try {
    // Zapisz kod i wygeneruj prosty test jednostkowy
    const tempFilePath = './tempCode.js';
    const tempTestPath = './tempCode.test.js';
    fs.writeFileSync(tempFilePath, code);

    // Przykładowy test jednostkowy
    const testCode = `
      const tempCode = require('./tempCode');
      test('Funkcja działa poprawnie', () => {
        expect(tempCode()).toBeDefined();
      });
    `;
    fs.writeFileSync(tempTestPath, testCode);

    // Uruchom testy jednostkowe przy użyciu Jest
    exec(`jest ${tempTestPath} --json`, (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd podczas uruchamiania testów jednostkowych.' });
      }

      const testResults = JSON.parse(stdout);
      res.json({ testResults });
    });
  } catch (error) {
    logger.error('Błąd podczas testowania jednostkowego:', { error: error.message });
    res.status(500).json({ error: 'Nie udało się wykonać testów jednostkowych.' });
  }
};

module.exports = { generateCode, getCodeHistory, runCode, checkSyntax, lintCode, runUnitTests };
