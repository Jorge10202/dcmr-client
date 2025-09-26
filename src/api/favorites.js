import api from './index';

const favoritesApi = {
  ids: () => api.get('/favorites/ids').then(r => r.data),          
  list: () => api.get('/favorites').then(r => r.data),             
  add: (id) => api.post(`/favorites/${id}`),
  remove: (id) => api.delete(`/favorites/${id}`),
  toggle: async (id, isFav) => isFav ? favoritesApi.remove(id) : favoritesApi.add(id)
};
export default favoritesApi;
