import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiService, setLogoutCallback } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Registrar la función logout en el interceptor de api.js
  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedRefreshToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response.data.data;

      await SecureStore.setItemAsync('token', newToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));

      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.refreshToken(refreshToken);
      const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

      await SecureStore.setItemAsync('token', newToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);

      setToken(newToken);
      setRefreshToken(newRefreshToken);

      return { success: true };
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    refreshToken,
    login,
    logout,
    refreshAuthToken,
    isAuthenticated: !!token,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
