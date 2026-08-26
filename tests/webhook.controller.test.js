import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Webhook API Routes', () => {
  test('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
  });

  test('POST /webhook returns welcome message if Body is empty', async () => {
    const res = await request(app)
      .post('/webhook')
      .type('form')
      .send({});

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/xml');
    expect(res.text).toContain('Welcome to the AI Debate Bot');
  });
});
