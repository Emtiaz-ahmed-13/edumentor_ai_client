
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
export const simplifyConcept = async (data) => {
  try {
    const response = await api.post('/ai/ask', {
      question: data.topic,
      difficulty: data.difficultyLevel,
    });
    return response.data.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      'Failed to simplify concept. Please check your connection and try again.';
    throw new Error(message);
  }
};

export const getHistory = async () => {
  try {
    const response = await api.get('/concepts/history');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to load history:', error.message);
    return [];
  }
};
export const getConceptById = async (id) => {
  try {
    const response = await api.get(`/concepts/${id}`);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch concept';
    throw new Error(message);
  }
};

export const deleteConcept = async (id) => {
  try {
    const response = await api.delete(`/concepts/${id}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to delete concept';
    throw new Error(message);
  }
};

export default api;
