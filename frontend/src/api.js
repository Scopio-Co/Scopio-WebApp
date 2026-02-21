// (axios) interceptors - intercept requests, auto-add auth headers

import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Helper function to get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor: attach JWT and CSRF token
api.interceptors.request.use(
  (config) => {
    // If caller sets config.skipAuth, do not attach Authorization header
    if (config && config.skipAuth) {
      return config;
    }
    
    // Attach JWT token
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Attach CSRF token for unsafe methods
    const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (unsafeMethods.includes(config.method?.toUpperCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, retry public GETs without auth once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error || {};
    const status = response?.status;
    const method = (config?.method || '').toUpperCase();
    const url = config?.url || '';

    const isPublicVideoEndpoint = method === 'GET' && (url.startsWith('/api/video'));
    const notYetRetried = !config?._retry;

    if (status === 401 && isPublicVideoEndpoint && notYetRetried) {
      // Retry once without Authorization header
      const newConfig = { ...config, _retry: true, skipAuth: true };
      if (newConfig.headers) {
        delete newConfig.headers.Authorization;
      }
      try {
        return await api.request(newConfig);
      } catch (retryErr) {
        // Fall through to original error if retry fails
        return Promise.reject(retryErr);
      }
    }
    return Promise.reject(error);
  }
);
export default api;

// Fetch CSRF token from backend
export async function fetchCsrfToken() {
  try {
    await api.get('/api/auth/csrf/');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

// API helpers
export async function fetchVideos() {
  // Normal call; if a stale/invalid token causes 401, client will retry unauthenticated once
  const { data } = await api.get('/api/video/videos/');
  return data;
}

// Login API call
export async function login(username, password) {
  const { data } = await api.post('/api/auth/login/', {
    username,
    password,
  });
  return data;
}

