import { useApi, ApiError } from './useApi.js';

const STORAGE_KEY = 'driveroom_session';

function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(sessionData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useAuth() {
  const api = useApi('/auth');

  return {
    getSession,

    async login(email, password) {
      try {
        const response = await api.post('/login', { email, password });
        if (response?.token) {
          saveSession(response);
        }
        return response;
      } catch (err) {
        throw err;
      }
    },

    async register(userData) {
      try {
        const response = await api.post('/register', userData);
        if (response?.token) {
          saveSession(response);
        }
        return response;
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