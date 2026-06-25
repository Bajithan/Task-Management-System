import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authApi = {
  login: (email, password) =>
    API.post('/auth/login', { email, password }).then((r) => r.data),

  forgotPassword: (email) =>
    API.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (email, token, newPassword) =>
    API.post('/auth/reset-password', { email, token, newPassword }).then((r) => r.data),

  forceResetPassword: (currentPassword, newPassword) =>
    API.post('/auth/force-reset-password', { currentPassword, newPassword }).then((r) => r.data),
};

export default authApi;