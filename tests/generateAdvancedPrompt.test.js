const request = require('supertest');
const { app } = require('../server');
const nock = require('nock');

describe('POST /api/code/generate-advanced-code', () => {
  beforeEach(() => {
    nock.cleanAll(); // Resetowanie mocków przed każdym testem
  });

  it('powinien wygenerować kod na podstawie zaawansowanego promptu', async () => {
    // Mockowanie odpowiedzi z API GPT
    const mockResponse = {
      choices: [
        { message: { content: 'Wygenerowany kod: print("Hello World!")' } }
      ]
    };

    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(200, mockResponse);

    const response = await request(app)
      .post('/api/code/generate-advanced-code')
      .send({
        appType: 'API REST',
        technologies: ['Node.js', 'MongoDB'],
        features: ['JWT authentication', 'File upload'],
        userInput: 'Aplikacja powinna obsługiwać filtrowanie danych według daty.'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('code');
    expect(response.body.code).toBe('Wygenerowany kod: print("Hello World!")');
  });

  it('powinien zwrócić błąd przy niepoprawnym żądaniu', async () => {
    const response = await request(app)
      .post('/api/code/generate-advanced-code')
      .send({}); // Wysyłanie pustego obiektu
  
    expect(response.statusCode).toBe(400); // Spodziewamy się statusu 400
    expect(response.body).toHaveProperty('error');
  });

  it('powinien obsłużyć błąd API OpenAI', async () => {
    // Mockowanie błędu API GPT
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .replyWithError('Błąd API OpenAI');

    const response = await request(app)
      .post('/api/code/generate-advanced-code')
      .send({
        appType: 'API REST',
        technologies: ['Node.js', 'MongoDB'],
        features: ['JWT authentication', 'File upload'],
        userInput: 'Aplikacja powinna obsługiwać filtrowanie danych według daty.'
      });

    expect(response.statusCode).toBe(500); // Spodziewamy się błędu serwera
    expect(response.body).toHaveProperty('error');
  });
});
