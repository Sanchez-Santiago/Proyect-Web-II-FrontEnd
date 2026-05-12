import { useApi } from './useApi.js';

export function useUpload() {
  const api = useApi('/upload');

  return {
    async image(file, vehicleId = null) {
      const formData = new FormData();
      formData.append('image', file);
      if (vehicleId) {
        formData.append('vehicleId', vehicleId);
      }
      return api.upload('/image', formData);
    },

    async imageFromUrl(url) {
      return api.post('/image', { imageUrl: url });
    }
  };
}

export default useUpload;
