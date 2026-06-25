import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const getTasks = (filters = {}) => API.get('/tasks', { params: filters }).then((r) => r.data);
export const getTaskById = (id) => API.get(`/tasks/${id}`).then((r) => r.data);
export const createTask = (taskData) => API.post('/tasks', taskData).then((r) => r.data);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData).then((r) => r.data);
export const updateTaskStatus = (id, status) => API.patch(`/tasks/${id}/status`, { status }).then((r) => r.data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`).then((r) => r.data);