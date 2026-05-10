import { useApi } from './useApi.js';

export function useVehicles() {
  const api = useApi('/vehicles');

  return {
    async getAll(filters = {}) {
      return api.get('/filters', filters);
    },

    async getById(id) {
      return api.get(`/filters/${id}`);
    },

    async getVehicle(id) {
      return api.get(`/${id}`);
    },

    async create(vehicleData) {
      return api.post('', vehicleData);
    },

    async update(id, vehicleData) {
      return api.put(`/${id}`, vehicleData);
    },

    async delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useVehicles;