import { useApi } from './useApi.js';

export function useDocuments() {
  const api = useApi('/documents');

  return {
    getByVehicle(vehicleId) {
      return api.get(`/vehicle/${vehicleId}`);
    },

    create(vehicleId, data) {
      return api.post(`/vehicle/${vehicleId}`, data);
    },

    verify(id) {
      return api.post(`/${id}/verify`);
    },

    delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useDocuments;
