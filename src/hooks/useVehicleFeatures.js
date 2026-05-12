import { useApi } from './useApi.js';

export function useVehicleFeatures() {
  const api = useApi('/vehicle-features');

  return {
    getAll() {
      return api.get();
    },

    getById(id) {
      return api.get(`/${id}`);
    },

    create(data) {
      return api.post('', data);
    },

    delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useVehicleFeatures;
