import axios from 'axios';

// Base URL for all API calls
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get the token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get dashboard summary data
export const getDashboardSummary = async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/dashboard/summary`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch dashboard data'
    );
  }
};