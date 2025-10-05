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
  verifyChallenge: (challengeId, answer) => 
    api.post(`/api/challenge/${challengeId}/verify`, { answer }),
  getProgress: () => api.get('/api/progress'),
  getPrize: () => api.get('/api/prize'),
  resetGame: () => api.post('/api/reset'),
};