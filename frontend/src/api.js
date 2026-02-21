// (axios) interceptors - intercept requests, auto-add auth headers

import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor: attach JWT unless explicitly skipped
api.interceptors.request.use(
  (config) => {
    // If caller sets config.skipAuth, do not attach Authorization header
    if (config && config.skipAuth) {
      return config;
    }
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
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

// API helpers
export async function fetchVideos() {
  // Normal call; if a stale/invalid token causes 401, client will retry unauthenticated once
  const { data } = await api.get('/api/video/videos/');
  return data;
}

