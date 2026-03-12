import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Clear token on 401, but let components handle redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  register: async (name, email, password, role) => {
    return api.post('/auth/register', { name, email, password, role });
  },

  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.user;
  },

  updateProfile: async (name, email) => {
    const response = await api.put('/auth/profile', { name, email });
    return response.user;
  },

  changePassword: async (currentPassword, newPassword) => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};

// ─── Course API ───────────────────────────────────────────────────────────────

export const courseAPI = {
  // Get all courses with optional filters
  getCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/courses${queryString ? `?${queryString}` : ''}`);
  },

  // Get single course by ID
  getCourse: async (id) => {
    return api.get(`/courses/${id}`);
  },

  // Create a new course (teacher/admin only)
  createCourse: async (courseData) => {
    return api.post('/courses', courseData);
  },

  // Update a course (creator/admin only)
  updateCourse: async (id, courseData) => {
    return api.put(`/courses/${id}`, courseData);
  },

  // Delete a course (creator/admin only)
  deleteCourse: async (id) => {
    return api.delete(`/courses/${id}`);
  },

  // Enroll in a course
  enrollCourse: async (id) => {
    return api.post(`/courses/${id}/enroll`);
  },

  // Unenroll from a course
  unenrollCourse: async (id) => {
    return api.delete(`/courses/${id}/enroll`);
  },

  // Rate a course (enrolled students only)
  rateCourse: async (id, rating) => {
    return api.post(`/courses/${id}/rate`, { rating });
  },

  // Get user's enrolled courses
  getEnrolledCourses: async () => {
    return api.get('/courses/my/enrolled');
  },

  // Get teacher's created courses
  getCreatedCourses: async () => {
    return api.get('/courses/my/created');
  },
};

export default api;