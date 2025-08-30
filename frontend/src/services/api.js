import axios from 'axios';
import { store } from '../store';
import { clearCredentials, refreshToken } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const state = store.getState();
        const refreshTokenValue = state.auth.refreshToken;
        
        if (refreshTokenValue) {
          await store.dispatch(refreshToken()).unwrap();
          
          // Get new token and retry original request
          const newState = store.getState();
          const newToken = newState.auth.token;
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        store.dispatch(clearCredentials());
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Generic CRUD methods
  get: async (endpoint, params = {}) => {
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  post: async (endpoint, data = {}) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  put: async (endpoint, data = {}) => {
    const response = await api.put(endpoint, data);
    return response.data;
  },

  delete: async (endpoint) => {
    const response = await api.delete(endpoint);
    return response.data;
  },

  // File upload
  uploadFile: async (endpoint, file, progressCallback) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressCallback
    });

    return response.data;
  },

  // Download file
  downloadFile: async (endpoint, filename) => {
    const response = await api.get(endpoint, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  }
};

export default api;
