import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/ai";

export const sendMessageToAI = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      transcript: message,
    });
    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error(error.response?.data?.message || "Failed to communicate with AI");
  }
};
