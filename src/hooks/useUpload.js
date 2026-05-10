import { useApi } from './useApi.js';

export function useUpload() {
  const api = useApi('/upload');

  return {
    async image(file) {
      const formData = new FormData();
      formData.append('image', file);
      return api.upload('/image', formData);
    },

    async imageFromUrl(url) {
      return api.post('/image', { url });
    }
  };
}

export default useUpload;