import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { clearAuthCache } from './authCache';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const REACT_API_URL = globalThis?.process?.env?.REACT_APP_API_URL || '';
const API_URL = VITE_API_URL || REACT_API_URL;

const DEV_BACKEND_URL = 'http://localhost:8000';
const PROD_BACKEND_URL = 'https://scopio.in';

const GOOGLE_CALLBACK_DEV = 'http://localhost:8000/accounts/google/login/callback/';
const GOOGLE_CALLBACK_PROD = 'https://scopio.in/glogin/google/finalize/';

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

function isLocalhostHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isVercelHost(hostname) {
  return typeof hostname === 'string' && hostname.endsWith('.vercel.app');
}

function isLoopbackHost(hostname) {
  return isLocalhostHost(hostname) || hostname === '::1' || hostname === '[::1]';
}

function getEnvBackendUrlForCurrentHost() {
  const envUrl = normalizeBackendUrl(API_URL);
  if (!envUrl) {
    return '';
  }

  const currentHost = window?.location?.hostname || '';
  if (isLocalhostHost(currentHost)) {
    return envUrl;
  }

  try {
    const parsed = new URL(envUrl);
    if (isLoopbackHost(parsed.hostname)) {
      console.warn('⚠️ [API] Ignoring localhost API URL on non-localhost frontend host:', envUrl);
      return '';
    }
  } catch (_error) {
    // Keep env URL if parsing fails.
  }

  return envUrl;
}

function normalizeBackendUrl(url) {
  const normalized = stripTrailingSlash(url);
  if (!normalized) {
    return '';
  }

  // If app is on HTTPS, never keep non-local backend URLs as HTTP.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    try {
      const parsed = new URL(normalized);
      if (parsed.protocol === 'http:' && !isLocalhostHost(parsed.hostname)) {
        parsed.protocol = 'https:';
        return stripTrailingSlash(parsed.toString());
      }
    } catch (_error) {
      // Keep original value if URL parsing fails.
    }
  }

  return normalized;
}

export function getBackendBaseUrl() {
  const envUrl = getEnvBackendUrlForCurrentHost();
  if (envUrl) {
    return envUrl;
  }

  const host = window?.location?.hostname || '';
  if (isLocalhostHost(host)) {
    return DEV_BACKEND_URL;
  }

  return PROD_BACKEND_URL;
}

function getBackendBaseUrlCandidates() {
  const host = window?.location?.hostname || '';
  const envUrl = getEnvBackendUrlForCurrentHost();
  const primary = getBackendBaseUrl();
  const canonicalProd = normalizeBackendUrl(PROD_BACKEND_URL);

  const candidates = isVercelHost(host)
    ? ['', primary, envUrl, canonicalProd]
    : [primary, envUrl, canonicalProd, ''];

  return Array.from(new Set(candidates.filter((value) => value !== null && value !== undefined)));
}

export function getGoogleOAuthRedirectUri() {
  const host = window?.location?.hostname || '';
  return isLocalhostHost(host) ? GOOGLE_CALLBACK_DEV : GOOGLE_CALLBACK_PROD;
}

export function getGoogleLoginStartUrl(frontendOrigin = window?.location?.origin || '') {
  const base = getBackendBaseUrl();
  const origin = encodeURIComponent(frontendOrigin);
  return `${base}/glogin/google/start/?frontend_origin=${origin}`;
}

function isNetworkLevelError(error) {
  return !error?.response;
}

function isRetryableFallbackStatus(error) {
  const status = error?.response?.status;
  return [404, 405, 502, 503, 504].includes(status);
}

function isUnsafeMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method || '').toUpperCase());
}

function getCsrfTokenFromCookie() {
  if (typeof document === 'undefined') {
    return null;
  }

  const name = 'csrftoken=';
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(name)) {
      return decodeURIComponent(cookie.substring(name.length));
    }
  }
  return null;
}

function isPublicUnauthenticatedGet(url, method) {
  if (String(method || '').toUpperCase() !== 'GET') {
    return false;
  }

  return (
    String(url || '').startsWith('/api/video/videos/') ||
    String(url || '').startsWith('/api/video/courses/')
  );
}

const api = axios.create({
  baseURL: getBackendBaseUrl(),
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const requestConfig = { ...config };
    requestConfig.headers = requestConfig.headers || {};

    if (!requestConfig.skipAuth) {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 [API] Access token attached:', requestConfig.url);
      }
    }

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const method = String(originalRequest.method || '').toUpperCase();
    const url = String(originalRequest.url || '');
    const isAuthEndpoint = url.startsWith('/api/auth/');

    // Public GET endpoints can be retried once without Authorization header.
    if (isPublicUnauthenticatedGet(url, method)) {
      const retryWithoutAuth = {
        ...originalRequest,
        _retry: true,
        skipAuth: true,
        headers: {
          ...(originalRequest.headers || {}),
        },
      };
      delete retryWithoutAuth.headers.Authorization;

      console.warn('⚠️ [API] Retrying public GET without auth:', url);
      return api.request(retryWithoutAuth);
    }

    // Never refresh token for auth endpoints to avoid loops.
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) {
      console.error('❌ [API] No refresh token. Emitting auth:unauthorized');
      clearAuthCache();
      window.dispatchEvent(new Event('auth:unauthorized'));
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await api.post(
        '/api/auth/refresh/',
        { refresh },
        { skipAuth: true, _retry: true }
      );

      const newAccess = refreshResponse?.data?.access;
      const newRefresh = refreshResponse?.data?.refresh;

      if (!newAccess) {
        throw new Error('Refresh response does not include access token');
      }

      localStorage.setItem(ACCESS_TOKEN, newAccess);
      if (newRefresh) {
        localStorage.setItem(REFRESH_TOKEN, newRefresh);
      }

      const retryRequest = {
        ...originalRequest,
        _retry: true,
        headers: {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        },
      };

      console.log('🔁 [API] Token refreshed. Retrying request:', url);
      return api.request(retryRequest);
    } catch (refreshError) {
      console.error('❌ [API] Refresh failed. Emitting auth:unauthorized');
      clearAuthCache();
      window.dispatchEvent(new Event('auth:unauthorized'));
      return Promise.reject(refreshError);
    }
  }
);

async function requestWithBackendFallback(config, options = {}) {
  const candidates = getBackendBaseUrlCandidates();
  const validateResponse = options.validateResponse;
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await api.request({
        ...config,
        baseURL: candidate,
      });

      if (typeof validateResponse === 'function' && !validateResponse(response)) {
        lastError = new Error(`Invalid response payload from ${candidate || 'same-origin'}`);
        continue;
      }

      return response;
    } catch (requestError) {
      lastError = requestError;
      if (!isNetworkLevelError(requestError) && !isRetryableFallbackStatus(requestError)) {
        throw requestError;
      }
    }
  }

  throw lastError;
}

export async function fetchCsrfToken() {
  try {
    const response = await requestWithBackendFallback(
      {
        method: 'GET',
        url: '/api/auth/csrf/',
        skipAuth: true,
      },
      {
        validateResponse: (res) => res.status >= 200 && res.status < 300,
      }
    );

    const isProdLike = !isLocalhostHost(window?.location?.hostname || '');
    if (isProdLike) {
      console.log('🛡️ [CSRF] Production mode expects SameSite=None; Secure cookies from backend.');
    }
    console.log('✅ [CSRF] CSRF cookie fetched from:', response?.config?.baseURL || 'same-origin');
    return response?.data;
  } catch (error) {
    console.error('❌ [CSRF] Failed to fetch CSRF token:', error);
    return null;
  }
}

export async function fetchVideos() {
  const { data } = await api.get('/api/video/videos/');
  console.log('✅ [API] Videos fetched:', Array.isArray(data) ? data.length : 'ok');
  return data;
}

export async function login(username, password) {
  try {
    const { data } = await requestWithBackendFallback(
      {
        method: 'POST',
        url: '/api/auth/login/',
        data: { username, password },
        skipAuth: true,
      },
      {
        validateResponse: (res) => !!res?.data?.access && !!res?.data?.refresh,
      }
    );

    clearAuthCache();
    localStorage.setItem(ACCESS_TOKEN, data.access);
    localStorage.setItem(REFRESH_TOKEN, data.refresh);
    console.log('✅ [AUTH] Login success. Tokens stored.');
    return data;
  } catch (error) {
    console.error('❌ [AUTH] Login failed:', error);
    throw error;
  }
}

export default api;