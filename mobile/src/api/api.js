import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: __DEV__ 
    ? process.env.EXPO_PUBLIC_API_URL_DEV 
    : process.env.EXPO_PUBLIC_API_URL_PRO,
  timeout: 10000,
});

// Interceptor para añadir token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      Alert.alert('Sesión expirada', 'Por favor, inicia sesión nuevamente');
    }
    return Promise.reject(error);
  }
);

export default api;

// Funciones API
export const apiService = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),

  // Game
  generateGame: () => api.post('/api/generate'),
  getLevels: () => api.get('/api/levels'),
  getChallenge: (challengeId) => api.get(`/api/challenge/${challengeId}`),
  verifyChallenge: (challengeId, payload) => 
    api.post(`/api/challenge/${challengeId}/verify`, payload),
  getProgress: () => api.get('/api/progress'),
  getPrize: () => api.get('/api/prize'),
  resetGame: () => api.post('/api/reset'),

  // UserData (NUEVO)
  getUserData: () => api.get('/api/userdata'),
  getAvailableTypes: () => api.get('/api/userdata/types'),
  createUserData: (data) => api.post('/api/userdata', data),
  updateUserData: (id, data) => api.put(`/api/userdata/${id}`, data),
  deleteUserData: (id) => api.delete(`/api/userdata/${id}`),
  
  // Upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Prizes
  getUserPrizes: () => api.get('/api/prizes'),
  createPrize: (data) => api.post('/api/prizes', data),
  updatePrize: (id, data) => api.put(`/api/prizes/${id}`, data),
  deletePrize: (id) => api.delete(`/api/prizes/${id}`),

  // Share
  createShareCode: () => api.post('/api/share/create'),
  getUserShareCodes: () => api.get('/api/share/codes'),
  verifyShareCode: (code) => api.get(`/api/share/verify/${code}`),
  joinGame: (code) => api.post('/api/share/join', { code }),
  getGameInstances: () => api.get('/api/share/instances'),
  deactivateShareCode: (id) => api.delete(`/api/share/${id}`),
};