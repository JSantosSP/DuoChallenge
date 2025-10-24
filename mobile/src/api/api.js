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

// Helper para convertir rutas de imagen relativas a URLs completas
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, retornarla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, agregar el base URL
  const baseURL = __DEV__ 
    ? process.env.EXPO_PUBLIC_API_URL_DEV 
    : process.env.EXPO_PUBLIC_API_URL_PRO;
  
  return `${baseURL}${imagePath}`;
};

// Funciones API
export const apiService = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),

  // Game
  generateGame: () => api.post('/api/game/generate'),
  getLevels: (gameSetId) => api.get(`/api/game/${gameSetId}/levels`),
  getLevel: (levelId) => api.get(`/api/game/level/${levelId}`),
  verifyLevel: (levelId, payload) => 
    api.post(`/api/game/level/${levelId}/verify`, payload),
  getProgress: (gameSetId) => api.get(`/api/game/${gameSetId}/progress`),
  getPrize: () => api.get('/api/game/prize'),
  resetGame: () => api.post('/api/game/reset'),
  getGameHistory: (status) => api.get(`/api/game/history${status ? `?status=${status}` : ''}`),
  getGameStats: () => api.get('/api/game/stats'),
  getActiveGames: () => api.get('/api/game/active'),

  // UserData (NUEVO)
  getUserData: () => api.get('/api/userdata'),
  getAvailableTypes: () => api.get('/api/userdata/types'),
  createUserData: (data) => api.post('/api/userdata', data),
  updateUserData: (id, data) => api.put(`/api/userdata/${id}`, data),
  deleteUserData: (id) => api.delete(`/api/userdata/${id}`),
  
  // Upload (formData already created by caller)
  uploadImage: (formData) => {
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Prize Templates
  getPrizeTemplates: () => api.get('/api/prize-templates'),
  getPrizeTemplateById: (id) => api.get(`/api/prize-templates/${id}`),

  // Prizes
  getUserPrizes: () => api.get('/api/prizes'),
  getWonPrizes: () => api.get('/api/prizes/won'),
  createPrize: (data) => api.post('/api/prizes', data),
  updatePrize: (id, data) => api.put(`/api/prizes/${id}`, data),
  deletePrize: (id) => api.delete(`/api/prizes/${id}`),
  reactivatePrize: (id) => api.put(`/api/prizes/${id}/reactivate`),
  reactivateAllPrizes: () => api.put('/api/prizes/reactivate-all'),

  // Categories (for UserData)
  getCategories: () => api.get('/api/categories'),

  // Share
  createShareCode: () => api.post('/api/share/create'),
  getUserShareCodes: () => api.get('/api/share/codes'),
  getUserUsedShareCodes: () => api.get('/api/share/used-codes'),
  verifyShareCode: (code) => api.get(`/api/share/verify/${code}`),
  joinGame: (code) => api.post('/api/share/join', { code }),
  getSharedGames: () => api.get('/api/share/instances'),
  deactivateShareCode: (id) => api.delete(`/api/share/${id}`),
};