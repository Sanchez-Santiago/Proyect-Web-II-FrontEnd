import { useApi } from './useApi.js';

export function useUser() {
  const api = useApi('/user-preferences');

  return {
    async get() {
      return api.get();
    },

    async update(preferences) {
      return api.put('', preferences);
    },

    async remove() {
      return api.del();
    }
  };
}

export default useUser;