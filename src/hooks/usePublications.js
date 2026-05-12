import { useApi } from './useApi.js';

export function usePublications() {
  const api = useApi('/publications');

  return {
    getAll(filters = {}) {
      return api.get('/filters', filters);
    },

    getById(id) {
      return api.get(`/${id}`);
    },

    getByVehicleId(vehicleId) {
      return api.get(`/vehicle/${vehicleId}`);
    },

    create(data) {
      return api.post('', data);
    },

    update(id, data) {
      return api.put(`/${id}`, data);
    },

    updateStatus(id, status) {
      return api.put(`/${id}/status`, { status });
    },

    delete(id) {
      return api.del(`/${id}`);
    },

    addFeature(id, featureId) {
      return api.post(`/${id}/features`, { featureId });
    },

    removeFeature(id, featureId) {
      return api.del(`/${id}/features/${featureId}`);
    },

    getFeatures(id) {
      return api.get(`/${id}/features`);
    }
  };
}

export default usePublications;
