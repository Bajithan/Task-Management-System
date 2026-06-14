import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const getAllProjects = async () => {
  const response = await axios.get(`${API_URL}/projects`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await axios.get(`${API_URL}/projects/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createProject = async (data) => {
  const response = await axios.post(`${API_URL}/projects`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await axios.put(`${API_URL}/projects/${id}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axios.delete(`${API_URL}/projects/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};