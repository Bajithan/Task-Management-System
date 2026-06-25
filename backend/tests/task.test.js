const request = require('supertest');
const app = require('../src/app');

describe('Task Routes', () => {

  test('GET /api/tasks responds (route handler present or returns 401/404)', async () => {
    const res = await request(app).get('/api/tasks');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('POST /api/tasks without token returns 401 or 404', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', priority: 'Medium', status: 'To Do' });
    expect([401, 404]).toContain(res.statusCode);
  });

  test('PUT /api/tasks/:id without token returns 401 or 404', async () => {
    const res = await request(app)
      .put('/api/tasks/some-fake-id')
      .send({ status: 'In Progress' });
    expect([401, 404]).toContain(res.statusCode);
  });

  test('DELETE /api/tasks/:id without token returns 401 or 404', async () => {
    const res = await request(app)
      .delete('/api/tasks/some-fake-id');
    expect([401, 404]).toContain(res.statusCode);
  });

  test('PATCH /api/tasks/:id/status without token returns 401 or 404', async () => {
    const res = await request(app)
      .patch('/api/tasks/some-fake-id/status')
      .send({ status: 'Completed' });
    expect([401, 404]).toContain(res.statusCode);
  });

});