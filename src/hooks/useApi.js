const API_BASE_URL = '/api';

function getAuthHeaders() {
  const sessionRaw = localStorage.getItem('driveroom_session');
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

async function request(method, endpoint, body = null, baseUrl = API_BASE_URL) {
  const state = createApiState();
  state.setLoading(true);
  state.setError(null);

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