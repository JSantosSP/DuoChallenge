/**
 * @file AuthContext.js - Contexto de autenticación global
 * @description Gestiona el estado de autenticación, tokens y usuario actual
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiService, setLogoutCallback } from '../api/api';

/** Contexto de autenticación */
const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  /**
   * Carga tokens y usuario almacenados en SecureStore al iniciar la app
   */
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

  /**
   * Autentica al usuario con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<{success: boolean, message?: string}>}
   */
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

  /**
   * Refresca el token de acceso usando el refresh token
   * @returns {Promise<{success: boolean}>}
   */
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

  /**
   * Cierra sesión eliminando tokens y reseteando el estado
   */
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

/**
 * Hook para acceder al contexto de autenticación
 * @returns {Object} Contexto de autenticación con user, token, login, logout, etc.
 * @throws {Error} Si se usa fuera de AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
