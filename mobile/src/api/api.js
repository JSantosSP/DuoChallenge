/**
 * @file api.js - Cliente HTTP y servicios de API
 * @description Configura Axios con interceptores y define todos los servicios de la API REST
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { API_URL } from '../config/env';

/**
 * Cliente Axios configurado con URL base y timeout
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

/** Callback para ejecutar cuando se detecta sesión expirada */
let logoutCallback = null;

/**
 * Establece el callback de logout para ser ejecutado en errores 401
 * @param {Function} callback - Función a ejecutar al cerrar sesión
 */
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

/**
 * Interceptor de peticiones: agrega token de autenticación automáticamente
 * Lee el token de SecureStore y lo añade al header Authorization
 */
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

/**
 * Interceptor de respuestas: maneja errores 401 (sesión expirada)
 * Elimina tokens, muestra alerta y ejecuta callback de logout
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      Alert.alert('Sesión expirada', 'Por favor, inicia sesión nuevamente');
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/** Re-exportación de utilidad para construir URLs de imágenes */
export { getImageUrl } from '../config/env';

/**
 * Objeto con todos los servicios de la API organizados por dominio
 * @namespace apiService
 */
export const apiService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),

  generateGame: () => api.post('/api/game/generate'),
  getLevels: (gameSetId) => api.get(`/api/game/${gameSetId}/levels`),
  getLevel: (levelId) => api.get(`/api/game/level/${levelId}`),
  verifyLevel: (levelId, payload) => 
    api.post(`/api/game/level/${levelId}/verify`, payload),
  getProgress: (gameSetId) => api.get(`/api/game/${gameSetId}/progress`),
  getPrize: (gameSetId) => api.get('/api/game/prize', { 
    params: gameSetId ? { gameSetId } : {} 
  }),
  resetGame: () => api.post('/api/game/reset'),
  getGameHistory: (status) => api.get(`/api/game/history${status ? `?status=${status}` : ''}`),
  getGameStats: () => api.get('/api/game/stats'),
  getActiveGames: () => api.get('/api/game/active'),

  getUserData: () => api.get('/api/userdata'),
  getAvailableTypes: () => api.get('/api/userdata/types'),
  createUserData: (data) => api.post('/api/userdata', data),
  updateUserData: (id, data) => api.put(`/api/userdata/${id}`, data),
  deleteUserData: (id) => api.delete(`/api/userdata/${id}`),
  
  uploadImage: (formData) => {
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getPrizeTemplates: () => api.get('/api/prize-templates'),
  getPrizeTemplateById: (id) => api.get(`/api/prize-templates/${id}`),

  getUserPrizes: () => api.get('/api/prizes'),
  getWonPrizes: () => api.get('/api/prizes/won'),
  createPrize: (data) => api.post('/api/prizes', data),
  updatePrize: (id, data) => api.put(`/api/prizes/${id}`, data),
  deletePrize: (id) => api.delete(`/api/prizes/${id}`),
  reactivatePrize: (id) => api.put(`/api/prizes/${id}/reactivate`),
  reactivateAllPrizes: () => api.put('/api/prizes/reactivate-all'),

  getCategories: () => api.get('/api/categories'),

  createShareCode: () => api.post('/api/share/create'),
  getUserShareCodes: () => api.get('/api/share/codes'),
  getUserUsedShareCodes: () => api.get('/api/share/used-codes'),
  verifyShareCode: (code) => api.get(`/api/share/verify/${code}`),
  joinGame: (code) => api.post('/api/share/join', { code }),
  getSharedGames: () => api.get('/api/share/instances'),
  deactivateShareCode: (id) => api.delete(`/api/share/${id}`),
};
