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
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('isAdmin');
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
  getAll: (params) => api.get('/extras/ratings', { params }),
  update: (id, data) => api.put(`/extras/ratings/${id}`, data),
  delete: (id) => api.delete(`/extras/ratings/${id}`),
  getAdminAll: (params) => api.get('/mysql/ratings', { params }),
  createAdmin: (data) => api.post('/mysql/ratings', data),
  updateAdmin: (id, data) => api.put(`/mysql/ratings/${id}`, data),
  deleteAdmin: (id) => api.delete(`/mysql/ratings/${id}`),
};

export const discountsApi = {
  getAll: () => api.get('/extras/discounts'),
  getById: (id) => api.get(`/extras/discounts/${id}`),
  create: (data) => api.post('/extras/discounts', data),
  update: (id, data) => api.put(`/extras/discounts/${id}`, data),
  delete: (id) => api.delete(`/extras/discounts/${id}`),
};

export const partnersApi = {
  getAll: () => api.get('/partners'),
  getById: (id) => api.get(`/partners/${id}`),
  create: (data) => api.post('/partners', data),
  update: (id, data) => api.put(`/partners/${id}`, data),
  delete: (id) => api.delete(`/partners/${id}`),
};

export const organizersApi = {
  getAll: () => api.get('/mysql/organizers'),
  getById: (id) => api.get(`/mysql/organizers/${id}`),
  create: (data) => api.post('/mysql/organizers', data),
  update: (id, data) => api.put(`/mysql/organizers/${id}`, data),
  delete: (id) => api.delete(`/mysql/organizers/${id}`),
};

export const relationsApi = {
  getEventOrganizers: (params) => api.get('/relations/event-organizers', { params }),
  createEventOrganizer: (data) => api.post('/relations/event-organizers', data),
  deleteEventOrganizer: (id) => api.delete(`/relations/event-organizers/${id}`),
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
  getAll: (params) => api.get('/extras/payments', { params }),
};

export const purchaseApi = {
  create: (data) => api.post('/purchases', data),
};

export const mysqlApi = {
  getAll: (resource, params) => api.get(`/mysql/${resource}`, { params }),
  getById: (resource, id) => api.get(`/mysql/${resource}/${id}`),
  create: (resource, data) => api.post(`/mysql/${resource}`, data),
  update: (resource, id, data) => api.put(`/mysql/${resource}/${id}`, data),
  delete: (resource, id) => api.delete(`/mysql/${resource}/${id}`),
};


export const salesApi = {
  getAllOrders: (params) => api.get('/sales/orders', { params }),
  getOrderDetails: (orderId) => api.get('/sales/order-details', { params: { orderId } }),
  getClientById: (id) => api.get(`/sales/clients/${id}`),
  getClients: (params) => api.get('/sales/clients', { params }),
  createClient: (data) => api.post('/sales/clients', data),
  updateClient: (id, data) => api.put(`/sales/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/sales/clients/${id}`),
  getAdminOrders: () => api.get('/sales/orders/admin'),
  getTickets: (params) => api.get('/sales/tickets', { params }),
  getTicketById: (id) => api.get(`/sales/tickets/${id}`),
  createTicket: (data) => api.post('/sales/tickets', data),
  updateTicket: (id, data) => api.put(`/sales/tickets/${id}`, data),
  deleteTicket: (id) => api.delete(`/sales/tickets/${id}`),
};
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export default api;
