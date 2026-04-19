import { useApi } from './useApi.js';

export function useMessages() {
  const api = useApi('/messages');

  return {
    async send(messageData) {
      return api.post('', messageData);
    },

    async getConversations() {
      return api.get('/conversations');
    },

    async getByVehicle(vehicleId) {
      return api.get(`/vehicle/${vehicleId}`);
    },

    async search(filters = {}) {
      return api.get('/filters', filters);
    },

    async getById(id) {
      return api.get(`/${id}`);
    }
  };
}

export default useMessages;