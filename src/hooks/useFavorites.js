import { useApi } from './useApi.js';

export function useFavorites() {
  const api = useApi('/favorites');

  return {
    async getAll() {
      return api.get();
    },

    async add(vehicleId) {
      return api.post('', { vehicleId });
    },

    async remove(vehicleId) {
      return api.del(`/${vehicleId}`);
    },

    async check(vehicleId) {
      return api.get(`/check/${vehicleId}`);
    }
  };
}

export default useFavorites;