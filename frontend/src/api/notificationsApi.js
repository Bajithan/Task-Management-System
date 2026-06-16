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

export const getNotifications = () =>
  API.get('/notifications').then((r) => r.data);

export const markAsRead = (id) =>
  API.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllAsRead = () =>
  API.patch('/notifications/read-all').then((r) => r.data);