import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getDashboardSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dashboard/summary`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

export const getSystemConfig = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dashboard/system-config`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system config');
  }
};