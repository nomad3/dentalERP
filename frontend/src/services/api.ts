import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear auth and redirect to login
      useAuthStore.getState().clearAuth();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// BI Analytics API services
export const analyticsAPI = {
  // Executive BI endpoints
  getExecutiveKPIs: async (practiceIds: string[], dateRange: string) => {
    const response = await api.get('/analytics/executive-kpis', {
      params: { practiceIds: practiceIds.join(','), dateRange }
    });
    return response.data;
  },

  getRevenueAnalytics: async (practiceIds: string[], dateRange: string) => {
    const response = await api.get('/analytics/revenue-trends', {
      params: { practiceIds: practiceIds.join(','), dateRange }
    });
    return response.data;
  },

  getLocationPerformance: async (practiceIds: string[], dateRange: string) => {
    const response = await api.get('/analytics/location-performance', {
      params: { practiceIds: practiceIds.join(','), dateRange }
    });
    return response.data;
  },

  // Manager BI endpoints
  getManagerMetrics: async (practiceId: string, date: string) => {
    const response = await api.get('/analytics/manager-metrics', {
      params: { practiceId, date }
    });
    return response.data;
  },

  getOperationalInsights: async (practiceId: string, dateRange: string) => {
    const response = await api.get('/analytics/operational-insights', {
      params: { practiceId, dateRange }
    });
    return response.data;
  },

  // Clinician BI endpoints
  getClinicalMetrics: async (providerId: string, dateRange: string) => {
    const response = await api.get('/analytics/clinical-metrics', {
      params: { providerId, dateRange }
    });
    return response.data;
  },

  getTreatmentOutcomes: async (providerId: string, dateRange: string) => {
    const response = await api.get('/analytics/treatment-outcomes', {
      params: { providerId, dateRange }
    });
    return response.data;
  },

  // Integration health monitoring
  getIntegrationStatus: async () => {
    const response = await api.get('/integrations/status');
    return response.data;
  },

  // Patient acquisition analytics
  getPatientAcquisition: async (practiceIds: string[], dateRange: string) => {
    const response = await api.get('/analytics/patient-acquisition', {
      params: { practiceIds: practiceIds.join(','), dateRange }
    });
    return response.data;
  },

  // Staff productivity analytics
  getStaffProductivity: async (practiceIds: string[], dateRange: string) => {
    const response = await api.get('/analytics/staff-productivity', {
      params: { practiceIds: practiceIds.join(','), dateRange }
    });
    return response.data;
  },
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Practice management API
export const practiceAPI = {
  getPractices: async () => {
    const response = await api.get('/practices');
    return response.data;
  },

  getPracticeById: async (id: string) => {
    const response = await api.get(`/practices/${id}`);
    return response.data;
  },

  getLocations: async (practiceId: string) => {
    const response = await api.get(`/practices/${practiceId}/locations`);
    return response.data;
  },
};

export default api;
