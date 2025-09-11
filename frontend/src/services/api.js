import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }).then(res => res.data),
  register: (userData) => api.post('/auth/register/', userData).then(res => res.data),
  logout: () => api.post('/auth/logout/').then(res => res.data),
  getProfile: () => api.get('/auth/profile/').then(res => res.data),
  updateProfile: (profileData) => api.patch('/auth/profile/', profileData).then(res => res.data),
  getDashboard: () => api.get('/auth/dashboard/').then(res => res.data),
};

// Vehicle API
export const vehicleAPI = {
  getVehicles: (params) => api.get('/vehicles/', { params }).then(res => res.data),
  getVehicle: (id) => api.get(`/vehicles/${id}/`).then(res => res.data),
  searchVehicles: (params) => api.get('/vehicles/search/', { params }).then(res => res.data),
  checkAvailability: (id, startDate, endDate) => 
    api.get(`/vehicles/${id}/availability/`, { 
      params: { start_date: startDate, end_date: endDate } 
    }).then(res => res.data),
  getCategories: () => api.get('/vehicles/categories/').then(res => res.data),
  getBrands: () => api.get('/vehicles/brands/').then(res => res.data),
  createVehicle: (vehicleData) => api.post('/vehicles/create/', vehicleData).then(res => res.data),
  updateVehicle: (id, vehicleData) => api.patch(`/vehicles/${id}/update/`, vehicleData).then(res => res.data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}/delete/`).then(res => res.data),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings/', bookingData).then(res => res.data),
  getMyBookings: (params) => api.get('/bookings/my-bookings/', { params }).then(res => res.data),
  getBooking: (id) => api.get(`/bookings/${id}/`).then(res => res.data),
  updateBooking: (id, bookingData) => api.patch(`/bookings/${id}/update/`, bookingData).then(res => res.data),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel/`).then(res => res.data),
  getBookingSummary: (id) => api.get(`/bookings/${id}/summary/`).then(res => res.data),
  createPayment: (id, paymentData) => api.post(`/bookings/${id}/payment/`, paymentData).then(res => res.data),
  getStatistics: () => api.get('/bookings/statistics/').then(res => res.data),
  getAllBookings: (params) => api.get('/bookings/admin/all/', { params }).then(res => res.data),
};

// Admin Vehicle API
export const adminVehicleAPI = {
  // Vehicle Management
  getVehicles: (params) => api.get('/vehicles/admin/', { params }).then(res => res.data),
  createVehicle: (vehicleData) => {
    // Create a new axios instance for FormData requests
    const formDataApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      formDataApi.defaults.headers.Authorization = `Token ${token}`;
    }
    
    return formDataApi.post('/vehicles/admin/', vehicleData).then(res => res.data);
  },
  getVehicle: (id) => api.get(`/vehicles/admin/${id}/`).then(res => res.data),
  updateVehicle: (id, vehicleData) => {
    // Create a new axios instance for FormData requests
    const formDataApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      formDataApi.defaults.headers.Authorization = `Token ${token}`;
    }
    
    return formDataApi.put(`/vehicles/admin/${id}/`, vehicleData).then(res => res.data);
  },
  deleteVehicle: (id) => api.delete(`/vehicles/admin/${id}/`).then(res => res.data),
  
  // Categories
  getCategories: () => api.get('/vehicles/admin/categories/').then(res => res.data),
  createCategory: (categoryData) => api.post('/vehicles/admin/categories/', categoryData).then(res => res.data),
  
  // Brands
  getBrands: () => api.get('/vehicles/admin/brands/').then(res => res.data),
  createBrand: (brandData) => api.post('/vehicles/admin/brands/', brandData).then(res => res.data),
  
  // Analytics
  getAnalytics: (params) => api.get('/vehicles/admin/analytics/', { params }).then(res => res.data),
  
  // Export
  exportVehicles: (params) => api.get('/vehicles/admin/export/', { params, responseType: 'blob' }).then(res => res.data),
  
  // Bulk Operations
  bulkOperations: (operationData) => api.post('/vehicles/admin/bulk-operations/', operationData).then(res => res.data),
};

// Admin Booking API
export const adminBookingAPI = {
  // Booking Management
  getAllBookings: (params) => api.get('/bookings/admin/all/', { params }).then(res => res.data),
  getBooking: (id) => api.get(`/bookings/admin/${id}/`).then(res => res.data),
  createBooking: (bookingData) => api.post('/bookings/admin/create/', bookingData).then(res => res.data),
  updateBooking: (id, bookingData) => api.put(`/bookings/admin/${id}/`, bookingData).then(res => res.data),
  
  // Analytics
  getAnalytics: (params) => api.get('/bookings/admin/analytics/', { params }).then(res => res.data),
  
  // Bulk Operations
  bulkOperations: (operationData) => api.post('/bookings/admin/bulk-operations/', operationData).then(res => res.data),
  
  // Export/Import
  exportBookings: (params) => api.get('/bookings/admin/export/', { params, responseType: 'blob' }).then(res => res.data),
  importBookings: (formData) => api.post('/bookings/admin/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  
  // Financial Reports
  getFinancialOverview: (params) => api.get('/bookings/admin/financial/overview/', { params }).then(res => res.data),
  getRevenueAnalytics: (params) => api.get('/bookings/admin/financial/revenue-analytics/', { params }).then(res => res.data),
  getProfitLoss: (params) => api.get('/bookings/admin/financial/profit-loss/', { params }).then(res => res.data),
  exportFinancial: (params) => api.get('/bookings/admin/financial/export/', { params }).then(res => res.data),
  
  // Comprehensive Reports
  getBusinessIntelligence: (params) => api.get('/bookings/admin/reports/business-intelligence/', { params }).then(res => res.data),
  getOperationalMetrics: (params) => api.get('/bookings/admin/reports/operational-metrics/', { params }).then(res => res.data),
  getPredictiveAnalytics: (params) => api.get('/bookings/admin/reports/predictive-analytics/', { params }).then(res => res.data),
  getCustomReports: (params) => api.get('/bookings/admin/reports/custom-builder/', { params }).then(res => res.data),
};

// Admin Customer API
export const adminCustomerAPI = {
  // Customer Management
  getCustomers: (params) => api.get('/auth/admin/customers/', { params }).then(res => res.data),
  getCustomer: (id) => api.get(`/auth/admin/customers/${id}/`).then(res => res.data),
  createCustomer: (customerData) => api.post('/auth/admin/customers/create/', customerData).then(res => res.data),
  updateCustomer: (id, customerData) => api.put(`/auth/admin/customers/${id}/`, customerData).then(res => res.data),
  
  // Analytics
  getAnalytics: (params) => api.get('/auth/admin/customers/analytics/', { params }).then(res => res.data),
  
  // Bulk Operations
  bulkOperations: (operationData) => api.post('/auth/admin/customers/bulk-operations/', operationData).then(res => res.data),
  
  // Export
  exportCustomers: (params) => api.get('/auth/admin/customers/export/', { params }).then(res => res.data),
};

export default api;
