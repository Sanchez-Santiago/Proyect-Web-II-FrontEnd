import { useApi } from './useApi.js';

export function useReports() {
  const api = useApi('/reports');

  return {
    create(data) {
      return api.post('', data);
    },

    getAll(filters = {}) {
      return api.get('', filters);
    },

    getById(id) {
      return api.get(`/${id}`);
    },

    updateStatus(id, status) {
      return api.put(`/${id}/status`, { status });
    },

    delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useReports;
