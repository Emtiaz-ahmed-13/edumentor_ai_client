import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const submitQuiz = async (data, token) => {
  const response = await axios.post(`${API_URL}/quizzes/submit`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getWeakTopics = async (token) => {
  const response = await axios.get(`${API_URL}/quizzes/weak-topics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  submitQuiz,
  getWeakTopics,
};
