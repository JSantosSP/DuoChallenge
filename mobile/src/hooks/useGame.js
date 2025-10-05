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
            '¡Felicidades! 🎉',
            '¡Has completado todos los niveles! Tienes un premio esperándote ❤️',
            [{ text: 'Ver Premio', onPress: () => {} }]
          );
        } else if (data.data.levelCompleted) {
          Alert.alert(
            '¡Nivel Completado! 🌟',
            'Has desbloqueado el siguiente nivel',
            [{ text: 'Continuar' }]
          );
        } else {
          Alert.alert('¡Correcto! ✅', data.data.message);
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
    enabled: false, // Solo se ejecuta manualmente
  });

  // Reiniciar juego
  const resetMutation = useMutation({
    mutationFn: () => apiService.resetGame(),
    onSuccess: () => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      queryClient.invalidateQueries(['prize']);
      Alert.alert('¡Nuevo Juego! 🎮', 'Se han generado nuevos retos para ti');
    },
  });

  // Generar juego (primera vez)
  const generateMutation = useMutation({
    mutationFn: () => apiService.generateGame(),
    onSuccess: () => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      Alert.alert('¡Juego Creado! 🎉', 'Tus retos están listos');
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