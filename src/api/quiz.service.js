import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  timeout: 90000,
});

const quizService = {
  // Feature 9: Generate quiz from topic or material text
  generateQuiz: async ({ topic, difficulty = 'intermediate', numQuestions = 10, sourceType = 'topic', material = '' }) => {
    try {
      const response = await api.post('/quizzes/generate', {
        topic,
        difficulty,
        numQuestions,
        sourceType,
        material,
      });
      return response;
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      throw error;
    }
  },

  // Feature 10: Evaluate a descriptive/short-answer response
  evaluateAnswer: async ({ question, correctAnswer, userAnswer, maxPoints = 10 }) => {
    try {
      const response = await api.post('/quizzes/evaluate-answer', {
        question,
        correctAnswer,
        userAnswer,
        maxPoints,
      });
      return response;
    } catch (error) {
      console.error('Answer Evaluation Error:', error);
      throw error;
    }
  },

  // Feature 9: Generate quiz from uploaded PDF file
  generateFromPdf: async ({ file, difficulty = 'intermediate', numQuestions = 10 }) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('difficulty', difficulty);
      formData.append('numQuestions', String(numQuestions));
      const response = await api.post('/quizzes/generate-from-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      return response;
    } catch (error) {
      console.error('Quiz PDF Generation Error:', error);
      throw error;
    }
  },

  // Get quiz history
  getHistory: async () => {
    try {
      const response = await api.get('/quizzes/history');
      return response;
    } catch (error) {
      console.error('Quiz History Error:', error);
      throw error;
    }
  },

  // Get a single saved quiz by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response;
    } catch (error) {
      console.error('Get Quiz Error:', error);
      throw error;
    }
  },

  // Delete a quiz
  deleteQuiz: async (id) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      return response;
    } catch (error) {
      console.error('Delete Quiz Error:', error);
      throw error;
    }
  },

  // Feature 11 & 15: Submit quiz result to backend
  submitQuiz: async (data) => {
    try {
      const response = await api.post('/quizzes/submit', data);
      return response.data;
    } catch (error) {
      console.error('Quiz Submission Error:', error);
      throw error;
    }
  },

  // Feature 11: Get subjects with low accuracy
  getWeakTopics: async () => {
    try {
      const response = await api.get('/quizzes/weak-topics');
      return response.data;
    } catch (error) {
      console.error('Weak Topics Error:', error);
      throw error;
    }
  },
};

export default quizService;
