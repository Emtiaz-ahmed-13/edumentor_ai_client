import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const logSession = async (data, token) => {
  const response = await axios.post(`${API_URL}/study/session`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateSchedule = async (data, token) => {
  const response = await axios.post(`${API_URL}/study/update-schedule`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getDueNotes = async (token) => {
  const response = await axios.get(`${API_URL}/study/due`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  logSession,
  updateSchedule,
  getDueNotes,
};
