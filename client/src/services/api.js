import axios from 'axios';

/**
 * Centralized Axios instance
 * Automatically sends cookies with requests (withCredentials: true)
 * Normalizes error handling across all frontend API calls
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle session expiration or global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns an error message, normalize it
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
