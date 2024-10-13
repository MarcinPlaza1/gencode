const request = require('supertest');
const { app, server } = require('../server'); // Importuj aplikację i serwer
const mongoose = require('mongoose'); // Import MongoDB, aby zamknąć połączenie po testach

// Test dla trasy generate-code
describe('POST /api/code/generate-code', () => {
  it('should generate code successfully', async () => {
    const response = await request(app)
      .post('/api/code/generate-code')
      .send({
        prompt: 'Hello World in Python',
        language: 'Python'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('code');
  });

  it('should return validation error for missing prompt', async () => {
    const response = await request(app)
      .post('/api/code/generate-code')
      .send({ language: 'Python' });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return validation error for unsupported language', async () => {
    const response = await request(app)
      .post('/api/code/generate-code')
      .send({ prompt: 'Hello World', language: 'Pascal' });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Wybrany język programowania nie jest obsługiwany.');
  });
});

// Test dla trasy history
describe('GET /api/code/history', () => {
  it('should return code history successfully', async () => {
    const response = await request(app).get('/api/code/history');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// Zamknięcie połączenia po zakończeniu wszystkich testów
afterAll(async () => {
  if (server) {
    await mongoose.connection.close(); // Zamknij połączenie z MongoDB
    await new Promise(resolve => server.close(resolve)); // Zamknij serwer po zakończeniu testów
  }
});
