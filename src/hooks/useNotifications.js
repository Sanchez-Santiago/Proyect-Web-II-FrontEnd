import { useApi } from './useApi.js';

export function useNotifications() {
  const api = useApi('/notifications');

  return {
    getAll(filters = {}) {
      return api.get('', filters);
    },

    markAsRead(id) {
      return api.post(`/${id}/read`);
    },

    markAllAsRead() {
      return api.post('/read-all');
    },

    delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useNotifications;
