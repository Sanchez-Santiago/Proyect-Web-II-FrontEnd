import { useApi } from './useApi.js';

export function useSavedSearches() {
  const api = useApi('/saved-searches');

  return {
    create(filters) {
      return api.post('', { filters });
    },

    getAll() {
      return api.get();
    },

    getById(id) {
      return api.get(`/${id}`);
    },

    update(id, filters) {
      return api.put(`/${id}`, { filters });
    },

    delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useSavedSearches;
