// controllers/promptController.js
const { defaultPrompts, promptTemplates } = require('../utils/prompts');
const FavoritePrompt = require('../models/favoritePrompt');
const { sendPromptToGPT } = require('../utils/openaiService');

// Pobierz domyślne prompty
const getDefaultPrompts = (req, res) => {
  try {
    res.json({ prompts: defaultPrompts });
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać domyślnych promptów.' });
  }
};

// Pobierz szablony promptów
const getPromptTemplates = (req, res) => {
  try {
    res.json({ templates: promptTemplates });
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać szablonów promptów.' });
  }
};

// Generowanie kodu na podstawie szablonu promptu
const generateCodeFromTemplate = async (req, res) => {
  const { templateTitle, variables } = req.body;
  const template = promptTemplates.find(t => t.title === templateTitle);

  if (!template) {
    return res.status(400).json({ error: 'Nie znaleziono szablonu.' });
  }

  for (const variable of template.variables) {
    if (!variables[variable]) {
      return res.status(400).json({ error: `Brakuje wartości dla zmiennej ${variable}.` });
    }
  }

  let aiPrompt = template.template;
  template.variables.forEach(variable => {
    aiPrompt = aiPrompt.replace(`{${variable}}`, variables[variable]);
  });

  try {
    await savePromptHistory(req.user.id, aiPrompt); // Zapis historii
    const response = await sendPromptToGPT(aiPrompt);

    if (response && response.choices && response.choices.length > 0) {
      const codeContent = response.choices[0].message.content.trim();
      res.json({ code: codeContent });
    } else {
      res.status(500).json({ error: 'Nie udało się wygenerować kodu.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas komunikacji z GPT.' });
  }
};

// Zapisz ulubiony prompt
const saveFavoritePrompt = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id;

  try {
    const favorite = new FavoritePrompt({ userId, prompt });
    await favorite.save();
    res.status(201).json({ message: 'Prompt dodany do ulubionych.' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas zapisywania ulubionego promptu.' });
  }
};

// Pobierz ulubione prompty
const getFavoritePrompts = async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await FavoritePrompt.find({ userId });
    res.json({ prompts: favorites.map(fav => fav.prompt) });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania ulubionych promptów.' });
  }
};

module.exports = {
  getDefaultPrompts,
  getPromptTemplates,
  generateCodeFromTemplate,
  saveFavoritePrompt,
  getFavoritePrompts,
};
