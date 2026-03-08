import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const ACTIVE_USER_ID_KEY = 'activeUserId';
// User-scoped cache keys are mandatory to prevent cross-account data leakage.
// Never store profile/stats/leaderboard under generic keys like "profile" or "user".
const USER_CACHE_PREFIXES = ['welcomeData', 'profile', 'stats', 'leaderboard', 'courseProgress'];
const LEGACY_USER_KEYS = ['welcomeData', 'profile', 'leaderboard', 'userStats', 'stats', 'courseProgress'];
const CLIENT_CLEARABLE_AUTH_COOKIES = ['access', 'refresh', 'csrftoken', 'sessionid'];

function safeStorageRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch (_error) {
    // Ignore storage access errors in private mode/restricted contexts.
  }
}

function safeStorageGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function safeStorageSet(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (_error) {
    // Ignore quota/access failures.
  }
}

function safeJsonParse(raw) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  try {
    const base64Url = segments[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
}

export function buildUserScopedKey(baseKey, userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return baseKey;
  }
  return `${baseKey}_${normalizedUserId}`;
}

export function getUserIdFromAccessToken() {
  const token = safeStorageGet(localStorage, ACCESS_TOKEN);
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload.user_id ?? payload.id ?? payload.sub ?? null;
  if (candidate === null || candidate === undefined) {
    return null;
  }

  return String(candidate).trim() || null;
}

export function getActiveUserId() {
  return safeStorageGet(localStorage, ACTIVE_USER_ID_KEY);
}

export function setActiveUserId(userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    safeStorageRemove(localStorage, ACTIVE_USER_ID_KEY);
    return null;
  }

  safeStorageSet(localStorage, ACTIVE_USER_ID_KEY, normalizedUserId);
  return normalizedUserId;
}

export function clearLegacyUserCacheKeys() {
  LEGACY_USER_KEYS.forEach((key) => safeStorageRemove(localStorage, key));
}

export function clearUserScopedCache(userId = null) {
  const storageLength = localStorage.length;
  const keysToDelete = [];
  const normalizedUserId = userId ? String(userId).trim() : '';

  for (let i = 0; i < storageLength; i += 1) {
    const key = localStorage.key(i);
    if (!key) {
      continue;
    }

    const matchesPrefix = USER_CACHE_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}_`));
    if (!matchesPrefix) {
      continue;
    }

    if (!normalizedUserId || key.endsWith(`_${normalizedUserId}`) || LEGACY_USER_KEYS.includes(key)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => safeStorageRemove(localStorage, key));
}

export function getUserScopedJson(baseKey, userId) {
  const key = buildUserScopedKey(baseKey, userId);
  return safeJsonParse(safeStorageGet(localStorage, key));
}

export function setUserScopedJson(baseKey, userId, data) {
  const key = buildUserScopedKey(baseKey, userId);
  safeStorageSet(localStorage, key, JSON.stringify(data));
}

export function clearSessionStorage() {
  try {
    sessionStorage.clear();
  } catch (_error) {
    // Ignore storage access errors.
  }
}

export function clearClientAccessibleAuthCookies() {
  if (typeof document === 'undefined') {
    return;
  }

  CLIENT_CLEARABLE_AUTH_COOKIES.forEach((cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

export function clearAuthTokens() {
  safeStorageRemove(localStorage, ACCESS_TOKEN);
  safeStorageRemove(localStorage, REFRESH_TOKEN);
}

export function clearAuthCache() {
  clearAuthTokens();
  clearLegacyUserCacheKeys();
  clearUserScopedCache();
  setActiveUserId(null);
  clearSessionStorage();
  clearClientAccessibleAuthCookies();
}

export function clearAllAuthAndUserCache() {
  clearAuthCache();
}

export function getCachedProfile(userId) {
  return getUserScopedJson('profile', userId);
}

export function setCachedProfile(userId, data) {
  setUserScopedJson('profile', userId, data);
}

export function getCachedStats(userId) {
  return getUserScopedJson('stats', userId);
}

export function setCachedStats(userId, data) {
  setUserScopedJson('stats', userId, data);
}

export function getCachedLeaderboard(userId) {
  return getUserScopedJson('leaderboard', userId);
}

export function setCachedLeaderboard(userId, data) {
  setUserScopedJson('leaderboard', userId, data);
}

export function handleUserSwitch(newUserId) {
  const normalizedNewUserId = String(newUserId || '').trim();
  const previousUserId = getActiveUserId();

  clearLegacyUserCacheKeys();
  clearSessionStorage();

  if (previousUserId && normalizedNewUserId && previousUserId !== normalizedNewUserId) {
    clearUserScopedCache(previousUserId);
  }

  return setActiveUserId(normalizedNewUserId);
}
