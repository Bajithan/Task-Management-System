const request = require('supertest');
const app = require('../src/app');

describe('Auth Routes', () => {

  // Test 1: Login with wrong credentials should return 401
  test('POST /api/auth/login with invalid credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notreal@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  // Test 2: Login with missing fields should return 400
  test('POST /api/auth/login with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '' });

    expect(res.statusCode).toBe(400);
  });

  // Test 3: Login endpoint exists (not 404)
  test('POST /api/auth/login route exists', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'somepassword' });

    expect(res.statusCode).not.toBe(404);
  });

});