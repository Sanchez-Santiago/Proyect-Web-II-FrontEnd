import { useApi } from './useApi.js';

export function useAdmin() {
  const api = useApi('/admin');

  return {
    getUsers(filters = {}) {
      return api.get('/users', filters);
    },

    getUser(id) {
      return api.get(`/users/${id}`);
    },

    updateUser(id, data) {
      return api.put(`/users/${id}`, data);
    },

    updateRole(id, role) {
      return api.put(`/users/${id}/role`, { role });
    },

    verifyUser(id, verified = true) {
      return api.put(`/users/${id}/verify`, { verified });
    },

    deleteUser(id) {
      return api.del(`/users/${id}`);
    },

    getSummary() {
      return api.get('/analytics/summary');
    },

    getTimeline(days = 30) {
      return api.get('/analytics/timeline', { days });
    }
  };
}

export default useAdmin;
