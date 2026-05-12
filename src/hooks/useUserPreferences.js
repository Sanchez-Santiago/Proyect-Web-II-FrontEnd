import { useApi } from './useApi.js';

export function useUserPreferences() {
  const api = useApi('/user-preferences');

  return {
    get() {
      return api.get();
    },

    update(data) {
      return api.put('', data);
    },

    delete() {
      return api.del();
    }
  };
}

export default useUserPreferences;
