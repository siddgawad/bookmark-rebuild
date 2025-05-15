
import request from 'supertest';
import express from 'express';
import healthRoute from '../routes/healthRoute.js';

const app = express();
app.use('/api/health', healthRoute);

describe('GET /api/health', () => {
  it('should return status 200 and a message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });
});
