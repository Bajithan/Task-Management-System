import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const usersApi = {
  getUsers: (search, role) =>
    API.get('/users', { params: { search, role } }).then((r) => r.data),

  getUserById: (id) =>
    API.get(`/users/${id}`).then((r) => r.data),

  createUser: (data) =>
    API.post('/users', data).then((r) => r.data),

  updateUser: (id, data) =>
    API.put(`/users/${id}`, data).then((r) => r.data),

  deactivateUser: (id) =>
    API.patch(`/users/${id}/deactivate`).then((r) => r.data),

  getAssignableUsers: () =>
    API.get('/users/assignable').then((r) => r.data),
};

export default usersApi;