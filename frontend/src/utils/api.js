import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const eventApi = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  search: (query) => api.get('/events/search', { params: { q: query } }),
  filter: (filters) => api.get('/events/filter', { params: filters }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getVenues: () => api.get('/events/venues'),
  createVenue: (data) => api.post('/events/venues', data),
  updateVenue: (id, data) => api.put(`/events/venues/${id}`, data),
  deleteVenue: (id) => api.delete(`/events/venues/${id}`),
  getSectors: (venueId) => venueId ? api.get('/events/sectors', { params: { venueId } }) : api.get('/events/sectors'),
  getSectorById: (id) => api.get(`/events/sectors/${id}`),
  createSector: (data) => api.post('/events/sectors', data),
  updateSector: (id, data) => api.put(`/events/sectors/${id}`, data),
  deleteSector: (id) => api.delete(`/events/sectors/${id}`),
};

export const uploadApi = {
  uploadImage: (formData) => api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const ratingsApi = {
  getByEvent: (eventId) => api.get('/extras/ratings', { params: { eventId } }),
  create: (data) => api.post('/extras/ratings', data),
};

export const partnersApi = {
  getAll: () => api.get('/partners'),
  getById: (id) => api.get(`/partners/${id}`),
  create: (data) => api.post('/partners', data),
  update: (id, data) => api.put(`/partners/${id}`, data),
  delete: (id) => api.delete(`/partners/${id}`),
};

export const ticketApi = {
  getTickets: (eventId) => api.get(`/events/${eventId}/tickets`),
  purchaseTickets: (eventId, data) => api.post(`/events/${eventId}/tickets/purchase`, data),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my'),
};

export const paymentApi = {
  processPayment: (data) => api.post('/payments', data),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export default api;
