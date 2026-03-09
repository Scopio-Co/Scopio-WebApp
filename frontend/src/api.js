import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { clearAuthCache } from './authCache';

const DEV_BACKEND_URL = 'http://localhost:8000';
const PROD_BACKEND_URL = 'https://scopio.in';

const ENV_BACKEND_URL = (import.meta.env.VITE_API_URL || '').trim();

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

function isLocalFrontend() {
  const host = window?.location?.hostname || '';
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function getBackendBaseUrl() {
  // Dev: always use local Django over HTTP.
  if (isLocalFrontend()) {
    return DEV_BACKEND_URL;
  }

  // Prod/staging: keep explicit env URL when it exists and is HTTPS.
  if (ENV_BACKEND_URL) {
    const normalized = stripTrailingSlash(ENV_BACKEND_URL);
    try {
      const parsed = new URL(normalized);
      if (parsed.protocol === 'https:') {
        return normalized;
      }
    } catch {
      // Ignore malformed env URLs and fall back to canonical production URL.
    }
  }

  // Canonical production backend.
  return PROD_BACKEND_URL;
}

export const API_BASE_URL = getBackendBaseUrl();

function isUnsafeMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method || '').toUpperCase());
}

function getCsrfTokenFromCookie() {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookieName = 'csrftoken=';
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const raw of cookies) {
    const cookie = raw.trim();
    if (cookie.startsWith(cookieName)) {
      return decodeURIComponent(cookie.slice(cookieName.length));
    }
  }

  return null;
}

function setSessionTokens(accessToken, refreshToken) {
  // Always clear previous session state before storing new tokens.
  clearAuthCache();
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
});

let refreshPromise = null;

api.interceptors.request.use(
  (config) => {
    const requestConfig = { ...config };
    requestConfig.withCredentials = true;
    requestConfig.headers = requestConfig.headers || {};

    // Auth header for protected endpoints.
    if (!requestConfig.skipAuth) {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);
      if (accessToken) {
        requestConfig.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // CSRF header for mutating requests.
    if (isUnsafeMethod(requestConfig.method)) {
      const csrfToken = getCsrfTokenFromCookie();
      if (csrfToken) {
        requestConfig.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

async function performRefreshToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await api.post(
    '/api/auth/refresh/',
    { refresh: refreshToken },
    { skipAuth: true, _retry: true }
  );

  const newAccess = response?.data?.access;
  const newRefresh = response?.data?.refresh || refreshToken;
  if (!newAccess) {
    throw new Error('Refresh endpoint did not return an access token');
  }

  setSessionTokens(newAccess, newRefresh);
  return newAccess;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = String(originalRequest?.url || '');

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not refresh for login/refresh endpoints.
    if (requestUrl.startsWith('/api/auth/login/') || requestUrl.startsWith('/api/auth/refresh/')) {
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = performRefreshToken();
      }

      const freshAccess = await refreshPromise;
      refreshPromise = null;

      const retryConfig = {
        ...originalRequest,
        _retry: true,
        headers: {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${freshAccess}`,
        },
      };

      return api.request(retryConfig);
    } catch (refreshError) {
      refreshPromise = null;
      clearAuthCache();
      window.dispatchEvent(new Event('auth:unauthorized'));
      return Promise.reject(refreshError);
    }
  }
);

// Robust CSRF bootstrap for both local development and production.
export async function fetchCsrfToken() {
  try {
    const response = await api.get('/api/auth/csrf/', { skipAuth: true });
    const cookieToken = getCsrfTokenFromCookie();
    return {
      ok: true,
      csrfToken: cookieToken,
      data: response?.data || null,
    };
  } catch (error) {
    return {
      ok: false,
      csrfToken: null,
      error,
    };
  }
}

export async function login(username, password) {
  await fetchCsrfToken();

  const response = await api.post(
    '/api/auth/login/',
    { username, password },
    { skipAuth: true }
  );

  const accessToken = response?.data?.access;
  const refreshToken = response?.data?.refresh;
  if (!accessToken || !refreshToken) {
    throw new Error('Login succeeded but token payload is incomplete');
  }

  setSessionTokens(accessToken, refreshToken);
  return response.data;
}

export function getGoogleLoginStartUrl(frontendOrigin = window?.location?.origin || '') {
  const encodedOrigin = encodeURIComponent(frontendOrigin);
  return `${API_BASE_URL}/glogin/google/start/?frontend_origin=${encodedOrigin}`;
}

export default api;
