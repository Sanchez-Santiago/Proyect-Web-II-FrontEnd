const API_BASE_URL = '/api';
const INSPECTOR_MODE = true;

function getAuthHeaders() {
  const sessionRaw = localStorage.getItem('motormarket_session');
  if (!sessionRaw) return {};

  try {
    const session = JSON.parse(sessionRaw);
    return session.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch {
    return {};
  }
}

function createApiState() {
  let loading = false;
  let error = null;
  let data = null;

  return {
    get loading() { return loading; },
    get error() { return error; },
    get data() { return data; },
    setLoading(v) { loading = v; },
    setError(v) { error = v; },
    setData(v) { data = v; },
    reset() {
      loading = false;
      error = null;
      data = null;
    }
  };
}

// Mock response helper for inspector mode
function createMockState(data) {
  const state = createApiState();
  state.setLoading(false);
  state.setData(data);
  return state;
}

async function request(method, endpoint, body = null, baseUrl = API_BASE_URL) {
  const state = createApiState();
  state.setLoading(true);
  state.setError(null);

  // Inspector mode: simulate API responses with mock data
  if (INSPECTOR_MODE) {
    return handleInspectorRequest(method, endpoint, body, state);
  }

  try {
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

    const url = body && Object.keys(body).length > 0 && method === 'GET'
      ? `${baseUrl}${endpoint}?${new URLSearchParams(body)}`
      : `${baseUrl}${endpoint}`;

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'Error en la solicitud', errorData);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      state.setData(await response.json());
    } else {
      state.setData(await response.text());
    }

  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    state.setError(err.message || 'Error de conexión');
    throw new ApiError(0, err.message || 'Error de conexión');
  } finally {
    state.setLoading(false);
  }

  return state;
}

async function handleInspectorRequest(method, endpoint, body, state) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    // Import inspector data dynamically
    const { getInspectorData } = await import('../data/inspector-data.js');
    const data = getInspectorData();

    // Parse endpoint to route to appropriate mock data
    if (endpoint.startsWith('/auth')) {
      handleAuthMock(method, endpoint, body, data, state);
    } else if (endpoint.startsWith('/vehicles')) {
      handleVehiclesMock(method, endpoint, body, data, state);
    } else if (endpoint.startsWith('/conversations')) {
      handleConversationsMock(method, endpoint, body, data, state);
    } else if (endpoint.startsWith('/favorites')) {
      handleFavoritesMock(method, endpoint, body, data, state);
    } else {
      state.setData({ success: true });
    }
  } catch (err) {
    state.setError(err.message);
    throw new ApiError(0, err.message);
  } finally {
    state.setLoading(false);
  }

  return state;
}

function handleAuthMock(method, endpoint, body, data, state) {
  if (endpoint === '/auth/login' && method === 'POST') {
    state.setData({ ...data.session, token: 'inspector-token-123' });
  } else if (endpoint === '/auth/register' && method === 'POST') {
    state.setData({ ...data.session, token: 'inspector-token-123' });
  } else if (endpoint === '/auth/me' && method === 'GET') {
    state.setData(data.session);
  } else if (endpoint === '/auth/logout' && method === 'POST') {
    state.setData({ success: true });
  } else {
    state.setData(data.session);
  }
}

function handleVehiclesMock(method, endpoint, body, data, state) {
  if (method === 'GET') {
    if (endpoint === '/vehicles' || endpoint === '/vehicles/') {
      state.setData(data.vehicles);
    } else {
      const matches = endpoint.match(/\/vehicles\/(\d+)/);
      if (matches) {
        const vehicle = data.vehicles.find(v => v.id == matches[1]);
        state.setData(vehicle || null);
      } else {
        state.setData(data.vehicles);
      }
    }
  } else if (method === 'POST' && endpoint === '/vehicles') {
    const newVehicle = { ...body, id: data.vehicles.length + 1 };
    data.vehicles.push(newVehicle);
    state.setData(newVehicle);
  } else if (method === 'PUT') {
    const matches = endpoint.match(/\/vehicles\/(\d+)/);
    if (matches) {
      const idx = data.vehicles.findIndex(v => v.id == matches[1]);
      if (idx !== -1) {
        data.vehicles[idx] = { ...data.vehicles[idx], ...body };
        state.setData(data.vehicles[idx]);
      }
    }
  } else if (method === 'DELETE') {
    const matches = endpoint.match(/\/vehicles\/(\d+)/);
    if (matches) {
      const idx = data.vehicles.findIndex(v => v.id == matches[1]);
      if (idx !== -1) {
        data.vehicles.splice(idx, 1);
        state.setData({ success: true });
      }
    }
  }
}

function handleConversationsMock(method, endpoint, body, data, state) {
  if (method === 'GET') {
    state.setData(data.conversations);
  } else if (method === 'POST') {
    const newConversation = { ...body, id: data.conversations.length + 1 };
    data.conversations.push(newConversation);
    state.setData(newConversation);
  }
}

function handleFavoritesMock(method, endpoint, body, data, state) {
  if (method === 'GET') {
    state.setData(data.favorites);
  } else if (method === 'POST') {
    if (!data.favorites.includes(body.vehicleId)) {
      data.favorites.push(body.vehicleId);
    }
    state.setData(data.favorites);
  } else if (method === 'DELETE') {
    const idx = data.favorites.indexOf(body.vehicleId);
    if (idx !== -1) {
      data.favorites.splice(idx, 1);
    }
    state.setData(data.favorites);
  }
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
      const state = createApiState();
      state.setLoading(true);

      try {
        const options = {
          method: 'POST',
          headers: getAuthHeaders()
        };

        options.body = formData;

        const response = await fetch(`${API_BASE_URL}${endpoint}${path}`, options);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(response.status, errorData.message || 'Error al subir archivo', errorData);
        }

        state.setData(await response.json());
      } catch (err) {
        if (err instanceof ApiError) throw err;
        state.setError(err.message);
        throw new ApiError(0, err.message);
      } finally {
        state.setLoading(false);
      }

      return state;
    }
  };
}

export { ApiError };
export default useApi;