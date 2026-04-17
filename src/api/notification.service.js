import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const getNotifications = async (token) => {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const markAsRead = async (id, token) => {
  const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  getNotifications,
  markAsRead,
};
