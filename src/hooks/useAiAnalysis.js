import { useApi } from './useApi.js';

export function useAiAnalysis() {
  const api = useApi('/ai-analysis');

  return {
    async create(analysisData) {
      return api.post('', analysisData);
    },

    async getByVehicle(vehicleId) {
      return api.get(`/vehicle/${vehicleId}`);
    },

    async update(id, analysisData) {
      return api.put(`/${id}`, analysisData);
    },

    async remove(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useAiAnalysis;