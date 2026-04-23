/**
 * Shared Axios instance.
 *
 * - Automatically attaches the JWT from localStorage as a Bearer token on
 *   every request.
 * - On a 401 response the token and user are cleared and the page reloads,
 *   sending the user back to the login screen.
 */
import axios from 'axios';
import API_BASE from './config.js';

const api = axios.create({ baseURL: API_BASE });

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dp_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle expired / invalid tokens ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dp_token');
      sessionStorage.removeItem('dp_user');
      // Reload to the login page
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
