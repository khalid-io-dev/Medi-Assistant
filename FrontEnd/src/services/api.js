import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// !:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const authService = {
  register: (data) => api.post('/users/register', data),
  login: (formData) => {
    return api.post('/users/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  logout: () => api.post('/users/logout'),
};

// !:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const chatService = {
  ask: (question) => api.post('/chat/', { question }),
  getHistory: (userId) => api.get(`/chat/history/${userId}`),
  getStats: () => api.get('/chat/stats'),
};

// !:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getHistory: () => api.get('/admin/history'),
  getAllUsers: () => api.get('/admin/all-users'),
  getUserHistory: (userId) => api.get(`/admin/users/${userId}/history`),
};

export default api;
