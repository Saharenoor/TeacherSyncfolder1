import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teachers API
export const teachersAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  getAvailability: (id) => api.get(`/teachers/${id}/availability`),
  updateAttendance: (id, attendance) => api.put(`/teachers/${id}/attendance`, attendance),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  create: (appointment) => api.post('/appointments', appointment),
  update: (id, updates) => api.put(`/appointments/${id}`, updates),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Admin API
export const adminAPI = {
  getTeachers: () => api.get('/admin/teachers'),
  getCabins: () => api.get('/admin/cabins'),
  getAppointments: () => api.get('/admin/appointments'),
  getTeacherAvailability: (id) => api.get(`/admin/teachers/${id}/availability`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
