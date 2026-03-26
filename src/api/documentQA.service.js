import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const documentQAService = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API_URL}/document-qa/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  },

  askQuestion: async (question, context, difficulty = "intermediate", conversationHistory = []) => {
    const response = await axios.post(`${API_URL}/document-qa/ask`, {
      question,
      context,
      difficulty,
      conversationHistory,
    }, {
      withCredentials: true,
    });
    return response.data;
  },
};

export default documentQAService;
