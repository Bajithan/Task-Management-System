const request = require('supertest');
const app = require('../src/app');

describe('Notification Routes', () => {

  // Test 1: Getting notifications without a token should return 401
  test('GET /api/notifications without token returns 401', async () => {
    const res = await request(app)
      .get('/api/notifications');

    expect(res.statusCode).toBe(401);
  });

  // Test 2: Marking a notification as read without token should return 401
  test('PUT /api/notifications/:id/read without token returns 401', async () => {
    const res = await request(app)
      .put('/api/notifications/some-fake-id/read');

    expect(res.statusCode).toBe(401);
  });

  // Test 3: Marking all notifications as read without token should return 401
  test('PUT /api/notifications/read-all without token returns 401', async () => {
    const res = await request(app)
      .put('/api/notifications/read-all');

    expect(res.statusCode).toBe(401);
  });

  // Test 4: Deleting a notification without token should return 401
  test('DELETE /api/notifications/:id without token returns 401', async () => {
    const res = await request(app)
      .delete('/api/notifications/some-fake-id');

    expect(res.statusCode).toBe(401);
  });

  // Test 5: Notification routes exist (not 404)
  test('GET /api/notifications route exists', async () => {
    const res = await request(app)
      .get('/api/notifications');

    expect(res.statusCode).not.toBe(404);
  });

});