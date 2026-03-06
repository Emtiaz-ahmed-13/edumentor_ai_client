
/**
 * Concept Service - API Calls for Concept Simplifier
 * Student: Syed Muntazir Mehdi (ID: 22299525)
 * Feature 4 - EduMentor AI
 */

import axios from 'axios';

// Create axios instance with base URL - FIXED: Added /v1 to match server
const API_BASE_URL = 'http://localhost:5001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if needed
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

/**
 * Simplify a concept using Gemini AI
 * @param {Object} data - { topic: string, difficultyLevel: string }
 * @returns {Promise} - AI response with explanation
 */
export const simplifyConcept = async (data) => {
  try {
    // Transform frontend data to match backend API format
    const requestData = {
      question: data.topic,
      difficulty: data.difficultyLevel
    };
    
    const response = await api.post('/ai/ask', requestData);
    return response.data.data; // Return the AI response data
  } catch (error) {
    // Handle and throw error with meaningful message
    const message = error.response?.data?.message || error.response?.data?.msg || 'Failed to simplify concept';
    throw new Error(message);
  }
};

/**
 * Get user's concept history
 * @returns {Promise} - Array of concept documents
 */
export const getHistory = async () => {
  try {
    const response = await api.get('/concepts/history');
    return response.data.data || response.data;
  } catch (error) {
    // Return empty array if no history endpoint exists
    return [];
  }
};

/**
 * Get a specific concept by ID
 * @param {string} id - Concept ID
 * @returns {Promise} - Concept document
 */
export const getConceptById = async (id) => {
  try {
    const response = await api.get(`/concepts/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch concept';
    throw new Error(message);
  }
};

/**
 * Delete a concept by ID
 * @param {string} id - Concept ID
 * @returns {Promise} - Success message
 */
export const deleteConcept = async (id) => {
  try {
    const response = await api.delete(`/concepts/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete concept';
    throw new Error(message);
  }
};

export default api;

