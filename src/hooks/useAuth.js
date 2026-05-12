import { useApi, ApiError } from './useApi.js';

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function normalizeUser(user, token, refreshToken) {
  return {
    id: user.id,
    name: user.name || user.fullName,
    email: user.email,
    role: (user.role || '').toLowerCase(),
    isAdmin: (user.role || '').toLowerCase() === 'admin',
    token: token || null,
    refreshToken: refreshToken || null
  };
}

export function useAuth() {
  const api = useApi('/auth');

  return {
    getSession,

    async login(email, password) {
      const response = await api.post('/login', { email, password });
      const token = response.accessToken || response.token;
      const refreshToken = response.refreshToken || null;
      if (token && response.user) {
        const session = normalizeUser(response.user, token, refreshToken);
        saveSession(session);
        return session;
      }
      throw new ApiError(0, response.message || 'Error al iniciar sesión');
    },

    async register(userData) {
      const response = await api.post('/register', userData);
      if (response.user) {
        return response;
      }
      throw new ApiError(0, response.message || 'Error al registrar');
    },

    async logout() {
      try {
        await api.post('/logout');
      } catch (err) {
        console.warn('Logout falló:', err.message);
      } finally {
        clearSession();
      }
    },

    async me() {
      try {
        const response = await api.get('/me');
        const user = response.user;
        if (user) {
          const session = normalizeUser(user);
          saveSession(session);
          return session;
        }
        clearSession();
        return null;
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
