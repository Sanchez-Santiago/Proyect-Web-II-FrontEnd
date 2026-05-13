import { useApi } from './useApi.js';

export function useChats() {
  const api = useApi('/chats');

  return {
    async createOrGet(publicationId) {
      return api.post('', { publicationId });
    },

    async getAll() {
      return api.get();
    },

    async getById(chatId) {
      return api.get(`/${chatId}`);
    },

    async getMessages(chatId, page = 1, limit = 50) {
      return api.get(`/${chatId}/messages`, { page, limit });
    },

    async sendMessage(chatId, message) {
      return api.post(`/${chatId}/messages`, { message });
    },

    async markAsRead(chatId) {
      return api.post(`/${chatId}/read`);
    },

    async getUnreadCount(chatId) {
      return api.get(`/${chatId}/unread`);
    },

    async delete(chatId) {
      return api.del(`/${chatId}`);
    }
  };
}

export default useChats;
