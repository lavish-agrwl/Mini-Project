import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

// Match API
export const matchAPI = {
  create: (data) => api.post("/matches", data),
  getAll: () => api.get("/matches"),
  getOne: (id) => api.get(`/matches/${id}`),
  update: (id, data) => api.put(`/matches/${id}`, data),
  delete: (id) => api.delete(`/matches/${id}`),
  start: (id, data) => api.post(`/matches/${id}/start`, data),
  recordBall: (id, data) => api.post(`/matches/${id}/ball`, data),
  editBall: (id, ballId, data) =>
    api.put(`/matches/${id}/ball/${ballId}`, data),
  getHistory: (id) => api.get(`/matches/${id}/history`),
};

export default api;
