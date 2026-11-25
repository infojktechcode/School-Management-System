import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('health endpoint', () => {
  it('reports healthy', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: expect.objectContaining({ status: 'healthy' }),
    });
  });

  it('is also mounted under /api/v1', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, message: expect.stringContaining('not found') });
  });
});
