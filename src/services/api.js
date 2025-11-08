import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// Vehicle Services
export const vehicleService = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Appointment Services
export const appointmentService = {
  create: (data) => api.post('/appointments', data),
  getMyAppointments: () => api.get('/appointments/my-appointments'),
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

// Manager Services - FIXED
export const managerService = {
  // FIXED: Changed from /jobs/unassigned to /appointments/unassigned
  getUnassignedJobs: () => api.get('/manager/appointments/unassigned'),
  
  // FIXED: Changed from /jobs/assign to /appointments/:id/assign
  assignJob: (id, mechanicId) => api.put(`/manager/appointments/${id}/assign`, { mechanicId }),
  
  getMechanics: () => api.get('/manager/mechanics'),
  getDashboardStats: () => api.get('/manager/stats'),
  createMechanic: (data) => api.post('/manager/mechanics', data),
};

// Mechanic Services - FIXED
export const mechanicService = {
  getMyJobs: () => api.get('/mechanic/jobs'),
  getMechanicStats: () => api.get('/mechanic/stats'),
  
  // FIXED: Changed from /start/:id to /:id/start
  startJob: (id) => api.put(`/mechanic/jobs/${id}/start`),
  
  // FIXED: Changed from /finish/:id to /:id/complete
  finishJob: (id) => api.put(`/mechanic/jobs/${id}/complete`),
  
  addParts: (id, data) => api.post(`/mechanic/jobs/${id}/parts`, data),
  addLabor: (id, data) => api.post(`/mechanic/jobs/${id}/labor`, data),
};

// Feedback Services
export const feedbackService = {
  create: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  getMyFeedback: () => api.get('/feedback/my-feedback'),
  getMechanicRatings: () => api.get('/feedback/mechanic-ratings'),
};

// Inventory Services
export const inventoryService = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Report Services
export const reportService = {
  generate: (params) => api.get('/reports/generate', { params }),
  getBookingStats: () => api.get('/reports/booking-stats'),
};

// Settings Services
export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;