import axios from 'axios';

// Create an instance of axios with the base URL for your backend
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add an interceptor to include the auth token in requests[span_1](end_span)
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Task API calls
export const getTasks = (filters) => API.get('/tasks', { params: filters });
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const updateTaskStatus = (id, status) => API.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => API.delete(`/tasks/${id}`);