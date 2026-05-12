import { useApi } from './useApi.js';
import state from '../js/state.js';

const STORAGE_KEY = 'motormarket_session';

function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(sessionData) {
  state.saveSession(sessionData);
}

function clearSession() {
  state.clearSession();
}

function readApiData(response) {
  return response?.data ?? response;
}

function normalizeRole(role) {
  return typeof role === 'string' ? role.toLowerCase() : role;
}

function createSession(authResponse) {
  const data = readApiData(authResponse);
  const user = data?.user || {};
  const role = normalizeRole(user.role || data?.role);

  return {
    ...user,
    ...data,
    user,
    role,
    roles: role ? [role] : [],
    token: data?.token
  };
}

export function useAuth() {
  const api = useApi('/auth');

  return {
    getSession,

    async login(email, password) {
      try {
        const response = await api.post('/login', { email, password });
        const session = createSession(response);
        if (session.token) {
          saveSession(session);
        }
        return readApiData(response);
      } catch (err) {
        throw err;
      }
    },

    async register(userData) {
      try {
        const response = await api.post('/register', userData);
        const session = createSession(response);
        if (session.token) {
          saveSession(session);
        }
        return readApiData(response);
      } catch (err) {
        throw err;
      }
    },

    async logout() {
      try {
        await api.post('/logout');
      } catch (err) {
        console.warn('Logout服务端 falló:', err.message);
      } finally {
        clearSession();
      }
    },

    async me() {
      try {
        const response = await api.get('/me');
        return response;
      } catch (err) {
        clearSession();
        throw err;
      }
    },

    isAuthenticated() {
      const session = getSession();
      return session !== null && !!session.token;
    },

    isAdmin() {
      const session = getSession();
      if (!session) return false;
      return session.isAdmin === true || session.role === 'admin';
    },

    getRole() {
      const session = getSession();
      return session?.role || null;
    }
  };
}

export default useAuth;
