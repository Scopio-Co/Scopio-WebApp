import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { clearAuthCache } from './authCache';

// Use canonical production API base URL.
// This avoids accidental /api/api/ rewriting issues across hosts.
export const API_BASE_URL = 'https://scopio.in/api/';

// Keep axios global defaults aligned for any direct axios usage.
axios.defaults.baseURL = API_BASE_URL;

function isUnsafeMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method || '').toUpperCase());
}

function normalizeApiPath(url) {
  if (typeof url !== 'string') {
    return url;
  }

  // If an absolute URL is provided, keep only its path/query/hash so axios
  // can safely combine it with baseURL without accidental host/path duplication.
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      url = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch (e) {
      // Fall through and use the original string when URL parsing fails.
    }
  }

  // Normalize missing leading slash: "api/auth/status/" -> "/api/auth/status/"
  if (!url.startsWith('/') && !url.startsWith('?') && !url.startsWith('#')) {
    url = `/${url}`;
  }

  // Defensive de-duplication: strip repeated /api prefixes so endpoints always
  // stay relative to API_BASE_URL and never become /api/api/...
  while (url.startsWith('/api/')) {
    url = url.slice(4);
  }

  return url;
}

function normalizeApiError(error) {
  const status = error?.response?.status ?? null;
  const data = error?.response?.data ?? null;
  const method = String(error?.config?.method || '').toUpperCase() || 'GET';
  const url = normalizeApiPath(String(error?.config?.url || ''));

  const fallbackMessage =
    status >= 500
      ? 'Server error. Please try again in a moment.'
      : status === 403
        ? 'Request blocked. Please refresh and try again.'
        : status === 401
          ? 'Authentication required. Please sign in again.'
          : 'Request failed. Please try again.';

  return {
    status,
    data,
    method,
    url,
    message: data?.detail || data?.error || error?.message || fallbackMessage,
    isServerError: status >= 500,
    isNetworkError: !error?.response,
    isAuthError: status === 401,
  };
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
    requestConfig.url = normalizeApiPath(requestConfig.url);
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
    '/auth/refresh/',
    { refresh: refreshToken },
    {
      skipAuth: true,
      _retry: true,
      // Keep cookie-backed session context during refresh flows.
      withCredentials: true,
    }
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
    const requestUrl = normalizeApiPath(String(originalRequest?.url || ''));

    error.apiError = normalizeApiError(error);

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not refresh for login/refresh endpoints.
    if (requestUrl.startsWith('/auth/login/') || requestUrl.startsWith('/auth/refresh/') || requestUrl.startsWith('/token/refresh/')) {
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
      refreshError.apiError = normalizeApiError(refreshError);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      return Promise.reject(refreshError);
    }
  }
);

// Robust CSRF bootstrap for both local development and production.
export async function fetchCsrfToken() {
  try {
    const response = await api.get('/auth/csrf/', {
      skipAuth: true,
      // Explicit for auth bootstrap clarity; interceptor also enforces this.
      withCredentials: true,
    });
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
      error: error?.apiError || normalizeApiError(error),
    };
  }
}

export async function login(username, password) {
  await fetchCsrfToken();

  const response = await api.post(
    '/auth/login/',
    { username, password },
    {
      skipAuth: true,
      // Explicit for credentialed auth sessions (form + OAuth follow-up calls).
      withCredentials: true,
    }
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
  // glogin is not under /api path - it's at root level
  return `/glogin/google/start/?frontend_origin=${encodedOrigin}`;
}

export default api;
