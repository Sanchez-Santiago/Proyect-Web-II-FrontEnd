import { useApi } from './useApi.js';

export function useChats() {
  const api = useApi('/chats');

  return {
    create(publicationId) {
      return api.post('', { publicationId });
    },

    getAll() {
      return api.get();
    },

    getById(id) {
      return api.get(`/${id}`);
    },

    getMessages(id) {
      return api.get(`/${id}/messages`);
    },

    sendMessage(id, message) {
      return api.post(`/${id}/messages`, { message });
    },

    markAsRead(id) {
      return api.post(`/${id}/read`);
    },

    unreadCount(id) {
      return api.get(`/${id}/unread`);
    },

    delete(id) {
      return api.del(`/${id}`);
    }
  };
}

export default useChats;
