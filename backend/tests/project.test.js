const request = require('supertest');
const app = require('../src/app');

describe('Project Routes', () => {

  test('GET /api/projects responds (route handler present or returns 401/404)', async () => {
    const res = await request(app).get('/api/projects');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('POST /api/projects without token returns 401 or 404', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Test Project' });
    expect([401, 404]).toContain(res.statusCode);
  });

  test('PUT /api/projects/:id without token returns 401 or 404', async () => {
    const res = await request(app)
      .put('/api/projects/some-fake-id')
      .send({ name: 'Updated' });
    expect([401, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/projects/:id without token returns 401 or 404', async () => {
    const res = await request(app)
      .delete('/api/projects/some-fake-id');
    expect([401, 404]).toContain(res.statusCode);
  });

});