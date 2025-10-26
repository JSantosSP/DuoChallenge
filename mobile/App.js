/**
 * @file App.js - Punto de entrada principal de la aplicación móvil DuoChallenge
 * @description Configura los proveedores globales (React Query, Auth) y el sistema de navegación
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Cliente de React Query configurado con opciones predeterminadas
 * - No refetch al enfocar ventana
 * - Un solo reintento en caso de error
 * - 5 minutos de tiempo de vigencia de datos en caché
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Componente raíz de la aplicación
 * @returns {JSX.Element} Aplicación envuelta en proveedores de React Query y Autenticación
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}