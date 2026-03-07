import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  timeout: 60000,
});

const aiService = {
  /**
   * Ask a question with difficulty and full conversation history for multi-turn context.
   * @param {string} question - The current user question.
   * @param {string} difficulty - Proficiency level (beginner, intermediate, advanced).
   * @param {Array<{role: string, content: string|object}>} conversationHistory - Prior chat turns.
   */
  askQuestion: async (question, difficulty = 'intermediate', conversationHistory = []) => {
    try {
      const response = await api.post('/ai/ask', { question, difficulty, conversationHistory });
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
