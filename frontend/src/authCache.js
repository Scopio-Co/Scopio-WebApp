import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const ACTIVE_USER_ID_KEY = 'activeUserId';
// User-scoped cache keys are mandatory to prevent cross-account data leakage.
// Never store profile/stats/leaderboard under generic keys like "profile" or "user".
const USER_CACHE_PREFIXES = ['welcomeData', 'profile', 'stats', 'leaderboard', 'courseProgress'];
const LEGACY_USER_KEYS = ['welcomeData', 'profile', 'leaderboard', 'userStats', 'stats', 'courseProgress'];
const CLIENT_CLEARABLE_AUTH_COOKIES = ['access', 'refresh', 'csrftoken', 'sessionid'];
const CACHE_SCHEMA_VERSION = 1;

// Cache TTLs are intentionally short to keep data fresh while still avoiding
// duplicate requests during navigation, refreshes, and same-tab transitions.
const CACHE_TTL_MS = {
  profile: 5 * 60 * 1000,
  stats: 2 * 60 * 1000,
  leaderboard: 1 * 60 * 1000,
};

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

function getNowMs() {
  return Date.now();
}

function normalizeUserId(userId) {
  const normalized = String(userId || '').trim();
  return normalized || null;
}

function buildCacheEnvelope({ userId, value, ttlMs }) {
  const cachedAt = getNowMs();
  const expiresAt = Number(ttlMs) > 0 ? cachedAt + Number(ttlMs) : null;
  return {
    v: CACHE_SCHEMA_VERSION,
    userId,
    cachedAt,
    expiresAt,
    value,
  };
}

function isCacheEnvelopeExpired(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    return true;
  }

  if (envelope.expiresAt === null || envelope.expiresAt === undefined) {
    return false;
  }

  return Number(envelope.expiresAt) <= getNowMs();
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
  const normalizedUserId = normalizeUserId(userId);
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
  const normalizedUserId = normalizeUserId(userId);
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
  const normalizedUserId = normalizeUserId(userId) || '';

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

function getUserScopedCacheValue(baseKey, userId) {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return null;
  }

  const key = buildUserScopedKey(baseKey, normalizedUserId);
  const parsed = safeJsonParse(safeStorageGet(localStorage, key));
  if (!parsed || typeof parsed !== 'object') {
    safeStorageRemove(localStorage, key);
    return null;
  }

  // Support legacy plain payloads by treating them as stale.
  if (!Object.prototype.hasOwnProperty.call(parsed, 'value')) {
    safeStorageRemove(localStorage, key);
    return null;
  }

  const envelopeUserId = normalizeUserId(parsed.userId);
  if (!envelopeUserId || envelopeUserId !== normalizedUserId) {
    safeStorageRemove(localStorage, key);
    return null;
  }

  if (isCacheEnvelopeExpired(parsed)) {
    safeStorageRemove(localStorage, key);
    return null;
  }

  return parsed.value;
}

function setUserScopedCacheValue(baseKey, userId, value, ttlMs) {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return;
  }

  const key = buildUserScopedKey(baseKey, normalizedUserId);
  const envelope = buildCacheEnvelope({
    userId: normalizedUserId,
    value,
    ttlMs,
  });
  safeStorageSet(localStorage, key, JSON.stringify(envelope));
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

export function clearAllCachedUserData() {
  clearLegacyUserCacheKeys();
  clearUserScopedCache();
  clearSessionStorage();
}

export function clearAllAuthAndUserCache() {
  clearAuthCache();
}

export function getCachedProfile(userId) {
  return getUserScopedCacheValue('profile', userId);
}

export function setCachedProfile(userId, data) {
  setUserScopedCacheValue('profile', userId, data, CACHE_TTL_MS.profile);
}

export function getCachedStats(userId) {
  return getUserScopedCacheValue('stats', userId);
}

export function setCachedStats(userId, data) {
  setUserScopedCacheValue('stats', userId, data, CACHE_TTL_MS.stats);
}

export function getCachedLeaderboard(userId) {
  return getUserScopedCacheValue('leaderboard', userId);
}

export function setCachedLeaderboard(userId, data) {
  setUserScopedCacheValue('leaderboard', userId, data, CACHE_TTL_MS.leaderboard);
}

export function getCacheTtlConfig() {
  return { ...CACHE_TTL_MS };
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
