import CONFIG from '../config.js';

const API_BASE_URL = CONFIG.API_BASE_URL;
const INSPECTOR_MODE = CONFIG.INSPECTOR_MODE;

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
      localStorage.removeItem('motormarket_session');
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
  if (INSPECTOR_MODE) {
    return handleInspectorRequest(method, endpoint, body);
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = body && method === 'GET'
    ? `${baseUrl}${endpoint}?${new URLSearchParams(body)}`
    : `${baseUrl}${endpoint}`;

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
    throw new ApiError(response.status, errorData.message || 'Error en la solicitud', errorData);
  }

  return handleResponse(response);
}

async function handleInspectorRequest(method, endpoint, body) {
  await new Promise(resolve => setTimeout(resolve, 200));

  const { getInspectorData } = await import('../data/inspector-data.js');
  const data = getInspectorData();

  if (endpoint.startsWith('/auth')) {
    if (endpoint === '/auth/login' && method === 'POST') {
      return { ...data.session, token: 'inspector-token-123' };
    }
    if (endpoint === '/auth/register' && method === 'POST') {
      return { ...data.session, token: 'inspector-token-123' };
    }
    if (endpoint === '/auth/me' && method === 'GET') {
      return data.session;
    }
    if (endpoint === '/auth/logout' && method === 'POST') {
      return { success: true };
    }
    return data.session;
  }

  if (endpoint.startsWith('/vehicles')) {
    if (method === 'GET') {
      if (endpoint === '/vehicles' || endpoint === '/vehicles/' || endpoint === '/vehicles/filters') {
        return { vehicles: data.vehicles };
      }
      const matches = endpoint.match(/\/vehicles\/(\d+)/);
      if (matches) {
        const vehicle = data.vehicles.find(v => v.id == matches[1]);
        return { vehicle: vehicle || null };
      }
      return { vehicles: data.vehicles };
    }
    if (method === 'POST' && (endpoint === '/vehicles' || endpoint === '/vehicles/')) {
      const newVehicle = { ...body, id: data.vehicles.length + 1 };
      data.vehicles.push(newVehicle);
      return { message: 'Vehículo creado exitosamente', vehicle: newVehicle };
    }
    if (method === 'PUT') {
      const matches = endpoint.match(/\/vehicles\/(\d+)/);
      if (matches) {
        const idx = data.vehicles.findIndex(v => v.id == matches[1]);
        if (idx !== -1) {
          data.vehicles[idx] = { ...data.vehicles[idx], ...body };
          return { message: 'Vehículo actualizado exitosamente', vehicle: data.vehicles[idx] };
        }
      }
    }
    if (method === 'DELETE') {
      const matches = endpoint.match(/\/vehicles\/(\d+)/);
      if (matches) {
        const idx = data.vehicles.findIndex(v => v.id == matches[1]);
        if (idx !== -1) {
          data.vehicles.splice(idx, 1);
          return { success: true };
        }
      }
    }
  }

  if (endpoint.startsWith('/conversations')) {
    if (method === 'GET') return data.conversations;
    if (method === 'POST') {
      const newConversation = { ...body, id: data.conversations.length + 1 };
      data.conversations.push(newConversation);
      return newConversation;
    }
  }

  if (endpoint.startsWith('/favorites')) {
    if (method === 'GET') return data.favorites;
    if (method === 'POST') {
      if (!data.favorites.includes(body.vehicleId)) {
        data.favorites.push(body.vehicleId);
      }
      return data.favorites;
    }
    if (method === 'DELETE') {
      const idx = data.favorites.indexOf(body.vehicleId);
      if (idx !== -1) data.favorites.splice(idx, 1);
      return data.favorites;
    }
  }

  return { success: true };
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

  return {
    async get(path = '', params = null) {
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
      if (INSPECTOR_MODE) {
        return { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d', message: 'Imagen subida' };
      }
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
