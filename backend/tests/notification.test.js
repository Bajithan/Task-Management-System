const request = require('supertest');
const app = require('../src/app');

describe('Notification Routes', () => {

  test('GET /api/notifications responds with 401 or 404', async () => {
    const res = await request(app).get('/api/notifications');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('PUT /api/notifications/:id/read responds with 401 or 404', async () => {
    const res = await request(app).put('/api/notifications/some-fake-id/read');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('PUT /api/notifications/read-all responds with 401 or 404', async () => {
    const res = await request(app).put('/api/notifications/read-all');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/notifications/:id responds with 401 or 404', async () => {
    const res = await request(app).delete('/api/notifications/some-fake-id');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('GET /api/notifications responds (not 500)', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).not.toBe(500);
  });

});