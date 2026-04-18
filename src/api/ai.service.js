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
      // Root check
      const response = await axios.get((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1').replace('/api/v1', ''));
      return response.data;
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  },

  analyzeCode: async (code, language = 'javascript', difficulty = 'intermediate') => {
    try {
      const response = await api.post('/ai/analyze-code', { code, language, difficulty });
      return response;
    } catch (error) {
      console.error('Code Analysis Error:', error);
      throw error;
    }
  },

  generateQuiz: async (topic, difficulty = 'intermediate', numQuestions = 5) => {
    try {
      const response = await api.post('/ai/generate-quiz', { topic, difficulty, numQuestions });
      // QuizGenerator expects response.data.data to be the questions array directly
      if (response.data?.data?.questions) {
        response.data.data = response.data.data.questions;
      }
      return response;
    } catch (error) {
      console.error('Generate Quiz Error:', error);
      throw error;
    }
  },

  evaluateAnswer: async (question, userAnswer, correctAnswer = '', maxPoints = 10) => {
    try {
      const response = await api.post('/ai/evaluate-answer', { question, userAnswer, correctAnswer, maxPoints });
      return response;
    } catch (error) {
      console.error('Evaluate Answer Error:', error);
      throw error;
    }
  }
};

export default aiService;
