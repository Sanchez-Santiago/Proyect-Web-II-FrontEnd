import { useApi } from './useApi.js';

export function usePublications() {
  const api = useApi('/publications');

  return {
    async getAll(filters = {}) {
      return api.get('/filters', filters);
    },

    async getById(id) {
      return api.get(`/${id}`);
    },

    async getByVehicleId(vehicleId) {
      return api.get(`/vehicle/${vehicleId}`);
    },

    async create(publicationData) {
      return api.post('', publicationData);
    },

    async update(id, publicationData) {
      return api.put(`/${id}`, publicationData);
    },

    async updateStatus(id, status) {
      return api.put(`/${id}/status`, { status });
    },

    async delete(id) {
      return api.del(`/${id}`);
    },

    async addFeature(id, featureId) {
      return api.post(`/${id}/features`, { featureId });
    },

    async removeFeature(id, featureId) {
      return api.del(`/${id}/features/${featureId}`);
    },

    async getFeatures(id) {
      return api.get(`/${id}/features`);
    }
  };
}

export default usePublications;
