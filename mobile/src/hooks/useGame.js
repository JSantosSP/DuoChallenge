import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api/api';
import { Alert } from 'react-native';

/**
 * Hook principal para gestionar juegos (GameSets)
 * Actualizado para soportar múltiples juegos activos
 */
export const useGame = (gameSetId = null) => {
  const queryClient = useQueryClient();

  // Obtener niveles de un GameSet específico
  const {
    data: levels,
    isLoading: levelsLoading,
    refetch: refetchLevels
  } = useQuery({
    queryKey: ['levels', gameSetId],
    queryFn: async () => {
      if (!gameSetId) return [];
      const response = await apiService.getLevels(gameSetId);
      return response.data.data.levels;
    },
    enabled: !!gameSetId,
  });

  // Obtener progreso de un GameSet específico
  const { 
    data: progress, 
    refetch: refetchProgress 
  } = useQuery({
    queryKey: ['progress', gameSetId],
    queryFn: async () => {
      if (!gameSetId) return null;
      const response = await apiService.getProgress(gameSetId);
      return response.data.data;
    },
    enabled: !!gameSetId,
  });

  // Obtener juegos activos del usuario
  const {
    data: activeGames,
    isLoading: activeGamesLoading,
    refetch: refetchActiveGames
  } = useQuery({
    queryKey: ['activeGames'],
    queryFn: async () => {
      const response = await apiService.getActiveGames();
      return response.data.data.games;
    },
  });

  // Obtener historial de juegos
  const getHistory = async (status = null) => {
    const response = await apiService.getGameHistory(status);
    return response.data.data.gameSets;
  };

  // Obtener estadísticas del usuario
  const {
    data: stats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const response = await apiService.getGameStats();
      return response.data.data;
    },
  });

  // Verificar nivel
  const verifyMutation = useMutation({
    mutationFn: ({ levelId, payload }) => 
      apiService.verifyLevel(levelId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['levels', gameSetId]);
      queryClient.invalidateQueries(['progress', gameSetId]);
      queryClient.invalidateQueries(['activeGames']);
      queryClient.invalidateQueries(['gameStats']);
      
      if (data.data.correct) {
        if (data.data.gameCompleted) {
          Alert.alert(
            '🎉 ¡Felicidades!',
            '¡Has completado todos los niveles! Tienes un premio esperándote',
            [{ text: 'Ver Premio', onPress: () => {} }]
          );
        } else if (data.data.levelCompleted) {
          Alert.alert(
            '✅ ¡Nivel Completado!',
            'Has desbloqueado el siguiente nivel',
            [{ text: 'Continuar' }]
          );
        } else {
          Alert.alert('¡Correcto! ✨', data.data.message);
        }
      }
    },
  });

  // Obtener premio de un juego completado
  const { data: prize, refetch: refetchPrize } = useQuery({
    queryKey: ['prize', gameSetId],
    queryFn: async () => {
      const response = await apiService.getPrize();
      return response.data.data.prize;
    },
    enabled: false,
  });

  // Reiniciar juego (abandonar juegos activos y generar uno nuevo)
  const resetMutation = useMutation({
    mutationFn: () => apiService.resetGame(),
    onSuccess: () => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      queryClient.invalidateQueries(['prize']);
      queryClient.invalidateQueries(['activeGames']);
      queryClient.invalidateQueries(['gameStats']);
      Alert.alert('🎮 ¡Nuevo Juego!', 'Se han generado nuevos retos para ti');
    },
  });

  // Generar nuevo juego
  const generateMutation = useMutation({
    mutationFn: () => apiService.generateGame(),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      queryClient.invalidateQueries(['activeGames']);
      queryClient.invalidateQueries(['gameStats']);
      
      const newGameSet = response.data.data.gameSet;
      Alert.alert('✨ ¡Juego Creado!', `Tu juego está listo con ${newGameSet.totalLevels} niveles`);
      return newGameSet;
    },
    onError: (error) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Debes añadir datos personales y premios primero'
      );
    },
  });

  return {
    // Datos de un GameSet específico
    levels,
    levelsLoading,
    progress,
    
    // Juegos activos y estadísticas
    activeGames,
    activeGamesLoading,
    stats,
    
    // Métodos
    verifyLevel: verifyMutation.mutate,
    verifyLoading: verifyMutation.isPending,
    prize,
    getPrize: refetchPrize,
    resetGame: resetMutation.mutate,
    generateGame: generateMutation.mutateAsync,
    getHistory,
    refetchLevels,
    refetchProgress,
    refetchActiveGames,
    refetchStats,
  };
};

/**
 * Hook para gestionar códigos compartidos y juegos compartidos
 */
export const useGameShare = () => {
  const queryClient = useQueryClient();

  // Obtener códigos del usuario
  const { 
    data: shareCodes, 
    isLoading: codesLoading, 
    refetch: refetchCodes 
  } = useQuery({
    queryKey: ['sharecodes'],
    queryFn: async () => {
      const response = await apiService.getUserShareCodes();
      return response.data.data.shareCodes;
    },
  });

  // Obtener juegos compartidos (GameSets de juegos unidos)
  const { 
    data: sharedGames, 
    isLoading: sharedGamesLoading, 
    refetch: refetchSharedGames 
  } = useQuery({
    queryKey: ['sharedGames'],
    queryFn: async () => {
      const response = await apiService.getSharedGames();
      return response.data.data.games;
    },
  });

  // Crear código
  const createCodeMutation = useMutation({
    mutationFn: () => apiService.createShareCode(),
    onSuccess: () => {
      queryClient.invalidateQueries(['sharecodes']);
      Alert.alert('✅ Éxito', 'Código generado correctamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al generar código');
    },
  });

  // Verificar código
  const verifyCodeMutation = useMutation({
    mutationFn: (code) => apiService.verifyShareCode(code),
  });

  // Unirse a juego
  const joinGameMutation = useMutation({
    mutationFn: (code) => apiService.joinGame(code),
    onSuccess: () => {
      queryClient.invalidateQueries(['sharedGames']);
      queryClient.invalidateQueries(['activeGames']);
      queryClient.invalidateQueries(['levels']);
      Alert.alert('🎉 ¡Genial!', 'Te has unido al juego exitosamente');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al unirse al juego');
    },
  });

  // Desactivar código
  const deactivateCodeMutation = useMutation({
    mutationFn: (id) => apiService.deactivateShareCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sharecodes']);
      Alert.alert('✅ Éxito', 'Código desactivado');
    },
  });

  return {
    shareCodes,
    codesLoading,
    sharedGames,
    sharedGamesLoading,
    refetchCodes,
    refetchSharedGames,
    createCode: createCodeMutation.mutate,
    verifyCode: verifyCodeMutation.mutateAsync,
    joinGame: joinGameMutation.mutate,
    deactivateCode: deactivateCodeMutation.mutate,
    isCreatingCode: createCodeMutation.isPending,
    isJoining: joinGameMutation.isPending,
  };
};

/**
 * Hook para premios ganados
 */
export const useWonPrizes = () => {
  const { data: wonPrizes, isLoading, refetch } = useQuery({
    queryKey: ['wonPrizes'],
    queryFn: async () => {
      const response = await apiService.getWonPrizes();
      return response.data.data.prizes;
    },
  });

  return {
    wonPrizes: wonPrizes || [],
    isLoading,
    refetch,
    total: wonPrizes?.length || 0,
  };
};
