import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1",
  timeout: 120000,
});

const noteService = {
  uploadNote: async (file, token) => {
    const formData = new FormData();
    formData.append("pdf", file);
    const response = await api.post("/notes/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getAllNotes: async (token) => {
    const response = await api.get("/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getNoteById: async (id, token) => {
    const response = await api.get(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateNote: async (id, { title }, token) => {
    const response = await api.patch(`/notes/${id}`, { title }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteNote: async (id, token) => {
    const response = await api.delete(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  askFromNote: async (noteId, question, token) => {
    const response = await api.post(
      `/notes/${noteId}/ask`,
      { question },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};

export default noteService;
