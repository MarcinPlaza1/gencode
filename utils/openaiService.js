const axiosInstance = require('./axiosInstance'); // Użycie wcześniej stworzonego axiosInstance

// Funkcja do wysyłania promptu do GPT
const sendPromptToGPT = async (prompt) => {
  try {
    const response = await axiosInstance.post('chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.data;
  } catch (error) {
    throw new Error('Błąd podczas wysyłania promptu do GPT');
  }
};

module.exports = {
  sendPromptToGPT,
};
