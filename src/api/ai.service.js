import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  timeout: 60000,
});


const aiService = {

  askQuestion: async (question) => {
    try {
      const response = await api.post('/ai/ask', { question });
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  checkHealth: async () => {
    try {
      const response = await api.get('/');
      return response;
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  }
};

export default aiService;
