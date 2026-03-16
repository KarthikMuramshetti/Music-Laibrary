import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE_URL });


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);


export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfilePicture: (formData) =>
    api.post('/api/auth/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const songsAPI = {
  getAll: (params = {}) => api.get('/api/songs', { params }),
  getAllAdmin: () => api.get('/api/songs/admin/all'),
  getById: (id) => api.get(`/api/songs/${id}`),
  add: (formData) =>
    api.post('/api/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/api/songs/${id}`, data),
  delete: (id) => api.delete(`/api/songs/${id}`),
  toggleVisibility: (id) => api.patch(`/api/songs/${id}/visibility`),
};


export const playlistsAPI = {
  getAll: () => api.get('/api/playlists'),
  create: (data) => api.post('/api/playlists', data),
  update: (id, data) => api.put(`/api/playlists/${id}`, data),
  delete: (id) => api.delete(`/api/playlists/${id}`),
  addSong: (id, songId) => api.post(`/api/playlists/${id}/songs`, { songId }),
  removeSong: (id, songId) => api.delete(`/api/playlists/${id}/songs/${songId}`),
};

export const artistsAPI = {
  getAll: () => api.get('/api/artists'),
  add: (formData) =>
    api.post('/api/artists', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/api/artists/${id}`, data),
  updatePhoto: (id, formData) =>
    api.patch(`/api/artists/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/api/artists/${id}`),
};


export const directorsAPI = {
  getAll: () => api.get('/api/directors'),
  add: (formData) =>
    api.post('/api/directors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/api/directors/${id}`, data),
  updatePhoto: (id, formData) =>
    api.patch(`/api/directors/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/api/directors/${id}`),
};

export const albumsAPI = {
  getAll: () => api.get('/api/albums'),
  add: (data) => api.post('/api/albums', data),
  update: (id, data) => api.put(`/api/albums/${id}`, data),
  delete: (id) => api.delete(`/api/albums/${id}`),
};

export const notificationsAPI = {
  getAll: () => api.get('/api/notifications'),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
  broadcast: (message) => api.post('/api/notifications/broadcast', { message }),
};

export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  return `${BASE_URL}/${filePath.replace(/\\/g, '/')}`;
};

export default api;
