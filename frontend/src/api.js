// (axios) interceptors - intercept requests, auto-add auth headers

import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

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
    
    // Attach JWT token from localStorage only
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 [API] Attached auth token to request:', config.url);
    } else {
      console.warn('⚠️ [API] No auth token found for request:', config.url);
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

    const notYetRetried = !config?._retry;
    const isAuthEndpoint = url.startsWith('/api/auth/');
    const isPublicVideoEndpoint =
      method === 'GET' &&
      (
        url.startsWith('/api/video/videos/') ||
        url.startsWith('/api/video/courses/')
      );

    if (status === 401 && notYetRetried) {
      // For public endpoints, retry once without auth header
      if (isPublicVideoEndpoint) {
        const newConfig = { ...config, _retry: true, skipAuth: true };
        if (newConfig.headers) {
          delete newConfig.headers.Authorization;
        }
        try {
          return await api.request(newConfig);
        } catch (retryErr) {
          return Promise.reject(retryErr);
        }
      }

      // For protected endpoints, try refresh flow once (but never for auth endpoints)
      if (!isAuthEndpoint) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        if (refreshToken) {
          try {
            const refreshResponse = await api.post(
              '/api/auth/refresh/',
              { refresh: refreshToken },
              { skipAuth: true }
            );

            const newAccessToken = refreshResponse?.data?.access;
            const newRefreshToken = refreshResponse?.data?.refresh;

            if (newAccessToken) {
              localStorage.setItem(ACCESS_TOKEN, newAccessToken);
            }
            if (newRefreshToken) {
              localStorage.setItem(REFRESH_TOKEN, newRefreshToken);
            }

            const retryConfig = {
              ...config,
              _retry: true,
              headers: {
                ...(config.headers || {}),
                Authorization: `Bearer ${newAccessToken || localStorage.getItem(ACCESS_TOKEN) || ''}`
              }
            };

            return await api.request(retryConfig);
          } catch (refreshError) {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            return Promise.reject(refreshError);
          }
        }
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
  console.log('🔐 [API] Calling login endpoint...');
  const { data } = await api.post('/api/auth/login/', {
    username,
    password,
  });
  
  console.log('✓ [API] Login response received:', { 
    hasAccess: !!data.access, 
    hasRefresh: !!data.refresh,
    accessLength: data.access?.length || 0,
    refreshLength: data.refresh?.length || 0
  });
  
  // Store tokens in localStorage (primary storage)
  if (data.access) {
    localStorage.setItem(ACCESS_TOKEN, data.access);
    console.log('✓ [API] Access token stored in localStorage');
  }
  if (data.refresh) {
    localStorage.setItem(REFRESH_TOKEN, data.refresh);
    console.log('✓ [API] Refresh token stored in localStorage');
  }
  
  // Verify tokens were actually stored
  const verifyAccess = localStorage.getItem(ACCESS_TOKEN);
  const verifyRefresh = localStorage.getItem(REFRESH_TOKEN);
  console.log('✓ [API] Tokens verified in storage:', { 
    accessStored: !!verifyAccess, 
    refreshStored: !!verifyRefresh 
  });
  
  if (!verifyAccess || !verifyRefresh) {
    console.error('❌ [API] Failed to store tokens!');
    throw new Error('Failed to store authentication tokens');
  }
  
  return data;
}

