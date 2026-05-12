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
    },

    async addImage(id, imageData) {
      return api.post(`/${id}/images`, imageData);
    },

    async addImagesBulk(id, images) {
      return api.post(`/${id}/images/bulk`, { images });
    },

    async getImages(id) {
      return api.get(`/${id}/images`);
    },

    async deleteImage(id, imageId) {
      return api.del(`/${id}/images/${imageId}`);
    }
  };
}

export default useVehicles;
