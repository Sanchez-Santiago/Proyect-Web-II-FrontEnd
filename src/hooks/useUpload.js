import { useApi } from './useApi.js';

export function useUpload() {
  const api = useApi('/upload');

  return {
    async image(file) {
      const formData = new FormData();
      formData.append('image', file);
      return api.upload('/image', formData);
    },

    async imageFromUrl(imageUrl) {
      return api.post('/image', { imageUrl });
    }
  };
}

export default useUpload;