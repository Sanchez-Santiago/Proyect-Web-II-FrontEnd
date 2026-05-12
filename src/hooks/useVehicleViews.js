import { useApi } from './useApi.js';

export function useVehicleViews() {
  const api = useApi('/vehicle-views');

  return {
    track(publicationId) {
      return api.post(`/publication/${publicationId}`);
    },

    getByPublication(publicationId) {
      return api.get(`/publication/${publicationId}`);
    },

    count(publicationId) {
      return api.get(`/publication/${publicationId}/count`);
    },

    myViews() {
      return api.get('/my-views');
    }
  };
}

export default useVehicleViews;
