import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api/api';
import { Alert } from 'react-native';

export const useGame = () => {
  const queryClient = useQueryClient();
  const [currentLevel, setCurrentLevel] = useState(null);

  // Obtener niveles
  const {
    data: levels,
    isLoading: levelsLoading,
    refetch: refetchLevels
  } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await apiService.getLevels();
      return response.data.data.levels;
    },
  });

  // Obtener progreso
  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await apiService.getProgress();
      return response.data.data;
    },
  });

  // Verificar reto
  const verifyMutation = useMutation({
    mutationFn: ({ challengeId, answer }) => 
      apiService.verifyChallenge(challengeId, answer),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      
      if (data.data.correct) {
        if (data.data.gameCompleted) {
          Alert.alert(
            '¡Felicidades!',
            '¡Has completado todos los niveles! Tienes un premio esperándote',
            [{ text: 'Ver Premio', onPress: () => {} }]
          );
        } else if (data.data.levelCompleted) {
          Alert.alert(
            '¡Nivel Completado!',
            'Has desbloqueado el siguiente nivel',
            [{ text: 'Continuar' }]
          );
        } else {
          Alert.alert('¡Correcto!', data.data.message);
        }
      }
    },
  });

  // Obtener premio
  const { data: prize, refetch: refetchPrize } = useQuery({
    queryKey: ['prize'],
    queryFn: async () => {
      const response = await apiService.getPrize();
      return response.data.data.prize;
    },
    enabled: false,
  });

  // Reiniciar juego
  const resetMutation = useMutation({
    mutationFn: () => apiService.resetGame(),
    onSuccess: () => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      queryClient.invalidateQueries(['prize']);
      queryClient.invalidateQueries(['userdata']); // Nuevo
      Alert.alert('¡Nuevo Juego!', 'Se han generado nuevos retos para ti');
    },
  });

  // Generar juego
  const generateMutation = useMutation({
    mutationFn: () => apiService.generateGame(),
    onSuccess: () => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      Alert.alert('¡Juego Creado!', 'Tus retos están listos');
    },
    onError: (error) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Debes añadir datos personales primero'
      );
    },
  });

  return {
    levels,
    levelsLoading,
    progress,
    currentLevel,
    setCurrentLevel,
    verifyChallenge: verifyMutation.mutate,
    verifyLoading: verifyMutation.isPending,
    prize,
    getPrize: refetchPrize,
    resetGame: resetMutation.mutate,
    generateGame: generateMutation.mutate,
    refetchLevels,
    refetchProgress,
  };
};

// Hook para UserData
export const useUserData = () => {
  const queryClient = useQueryClient();

  // Obtener datos del usuario
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['userdata'],
    queryFn: async () => {
      const response = await apiService.getUserData();
      return response.data.data.userData;
    },
  });

  // Obtener tipos disponibles
  const { data: availableTypes } = useQuery({
    queryKey: ['userdata-types'],
    queryFn: async () => {
      const response = await apiService.getAvailableTypes();
      return response.data.data.variables;
    },
  });

  // Crear dato
  const createMutation = useMutation({
    mutationFn: (data) => apiService.createUserData(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userdata']);
      Alert.alert('Éxito', 'Dato creado correctamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear dato');
    },
  });

  // Actualizar dato
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiService.updateUserData(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userdata']);
      Alert.alert('Éxito', 'Dato actualizado correctamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al actualizar dato');
    },
  });

  // Eliminar dato
  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.deleteUserData(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['userdata']);
      Alert.alert('Éxito', 'Dato eliminado correctamente');
    },
  });

  return {
    userData,
    isLoading,
    availableTypes,
    refetch,
    createData: createMutation.mutate,
    updateData: updateMutation.mutate,
    deleteData: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

// Hook para Premios del Usuario
export const useUserPrizes = () => {
  const queryClient = useQueryClient();

  // Obtener premios del usuario
  const { data: prizes, isLoading, refetch } = useQuery({
    queryKey: ['userprizes'],
    queryFn: async () => {
      const response = await apiService.getUserPrizes();
      return response.data.data;
    },
  });

  // Crear premio
  const createMutation = useMutation({
    mutationFn: (data) => apiService.createPrize(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userprizes']);
      Alert.alert('Éxito', 'Premio creado correctamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear premio');
    },
  });

  // Actualizar premio
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiService.updatePrize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userprizes']);
      Alert.alert('Éxito', 'Premio actualizado correctamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al actualizar premio');
    },
  });

  // Eliminar premio
  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.deletePrize(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['userprizes']);
      Alert.alert('Éxito', 'Premio eliminado correctamente');
    },
  });

  return {
    prizes,
    isLoading,
    refetch,
    createPrize: createMutation.mutate,
    updatePrize: updateMutation.mutate,
    deletePrize: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};