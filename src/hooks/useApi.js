import CONFIG from '../config.js';
import { cacheGet, cacheSet, cacheDelete } from '../core/cache.js';

const API_BASE_URL = CONFIG.API_BASE_URL;

function getSession() {
  try {
    const raw = localStorage.getItem('motormarket_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem('motormarket_session', JSON.stringify(session));
}

function getAuthHeaders() {
  const session = getSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

let isRefreshing = false;

async function refreshAccessToken() {
  if (isRefreshing) return null;
  isRefreshing = true;

  try {
    const session = getSession();
    if (!session?.refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'x-refresh-token': session.refreshToken }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      session.token = data.accessToken;
      if (data.refreshToken) session.refreshToken = data.refreshToken;
      saveSession(session);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

async function request(method, endpoint, body = null, baseUrl = API_BASE_URL) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  };

  // Normalizar baseUrl y endpoint para evitar double slashes (//)
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = body && method === 'GET'
    ? `${base}${path}?${new URLSearchParams(body)}`
    : `${base}${path}`;

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);

  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      options.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, options);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = response.status === 401
      ? 'Sesión expirada. Inicia sesión nuevamente.'
      : (errorData.message || `Error ${response.status}: ${response.statusText || 'Error en la solicitud'}`);
    throw new ApiError(response.status, message, errorData);
  }

  return handleResponse(response);
}

class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export function useApi(baseEndpoint = '') {
  const endpoint = baseEndpoint.startsWith('/') ? baseEndpoint : `/${baseEndpoint}`;

  function buildCacheKey(path, params) {
    return `${method}:${endpoint}${path}${params ? '?' + JSON.stringify(params) : ''}`;
  }

  const method = 'GET';

  return {
    async get(path = '', params = null, opts = {}) {
      if (opts.cache) {
        const key = buildCacheKey(path, opts.cacheParams || params);
        const cached = cacheGet(key);
        if (cached) return cached;
        const data = await request('GET', `${endpoint}${path}`, params);
        cacheSet(key, data, opts.ttl || 30000);
        return data;
      }
      return request('GET', `${endpoint}${path}`, params);
    },

    async post(path = '', body = {}) {
      return request('POST', `${endpoint}${path}`, body);
    },

    async put(path = '', body = {}) {
      return request('PUT', `${endpoint}${path}`, body);
    },

    async del(path = '') {
      return request('DELETE', `${endpoint}${path}`);
    },

    async upload(path = '', formData) {
      const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      };
      let response = await fetch(`${API_BASE_URL}${endpoint}${path}`, options);
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          options.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}${path}`, options);
        }
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Error al subir archivo', errorData);
      }
      return response.json();
    }
  };
}

export { ApiError };
export default useApi;
