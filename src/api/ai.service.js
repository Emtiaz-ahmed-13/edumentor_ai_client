import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  timeout: 60000,
});

const aiService = {
  /**
   * Ask a question with full conversation history for multi-turn context.
   * @param {string} question - The current user question.
   * @param {Array<{role: string, content: string|object}>} conversationHistory - Prior chat turns.
   */
  askQuestion: async (question, conversationHistory = []) => {
    try {
      const response = await api.post('/ai/ask', { question, conversationHistory });
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
