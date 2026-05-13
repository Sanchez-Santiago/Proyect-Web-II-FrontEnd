import { useApi, ApiError } from './useApi.js';

import { getSession, saveSession, clearSession } from '../core/session.js';

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
          const current = getSession();
          const session = normalizeUser(user, current?.token, current?.refreshToken);
          saveSession(session);
          return session;
        }
        clearSession();
        return null;
      } catch (err) {
        if (err.status !== 401) clearSession();
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
      const role = (session.role || '').toLowerCase();
      return session.isAdmin === true || role === 'admin';
    },

    getRole() {
      const session = getSession();
      return session?.role || null;
    }
  };
}

export default useAuth;
