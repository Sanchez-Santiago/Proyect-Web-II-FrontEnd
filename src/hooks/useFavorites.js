import { useApi } from './useApi.js';

export function useFavorites() {
  const api = useApi('/favorites');

  return {
    async getAll() {
      return api.get();
    },

    async add(publicationId) {
      return api.post('', { publicationId });
    },

    async remove(publicationId) {
      return api.del(`/${publicationId}`);
    },

    async check(publicationId) {
      return api.get(`/check/${publicationId}`);
    }
  };
}

export default useFavorites;
