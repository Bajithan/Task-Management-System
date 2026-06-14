const request = require('supertest');
const app = require('../src/app');

describe('User Routes', () => {

  // Test 1: Getting users without a token should return 401
  test('GET /api/users without token returns 401', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.statusCode).toBe(401);
  });

  // Test 2: Getting a single user without token should return 401
  test('GET /api/users/:id without token returns 401', async () => {
    const res = await request(app)
      .get('/api/users/some-fake-id');

    expect(res.statusCode).toBe(401);
  });

  // Test 3: Creating a user without token should return 401
  test('POST /api/users without token returns 401', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'testuser@test.com',
        role: 'Collaborator',
      });

    expect(res.statusCode).toBe(401);
  });

  // Test 4: Updating a user without token should return 401
  test('PUT /api/users/:id without token returns 401', async () => {
    const res = await request(app)
      .put('/api/users/some-fake-id')
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toBe(401);
  });

  // Test 5: User routes exist (not 404)
  test('GET /api/users route exists', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.statusCode).not.toBe(404);
  });

});