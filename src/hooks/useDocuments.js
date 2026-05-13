import { useApi } from './useApi.js';

export function useDocuments() {
  const api = useApi('/documents');

  return {
    async getByVehicle(vehicleId) {
      const res = await api.get(`/vehicle/${vehicleId}`);
      return res?.documents || [];
    },

    async create(vehicleId, documentType, documentUrl) {
      return api.post(`/vehicle/${vehicleId}`, { documentType, documentUrl });
    },

    async remove(id) {
      return api.delete(`/${id}`);
    }
  };
}

export default useDocuments;
