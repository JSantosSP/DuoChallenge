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
      // Invalidar queries para actualizar el estado
      queryClient.invalidateQueries(['levels', gameSetId]);
      queryClient.invalidateQueries(['progress', gameSetId]);
      queryClient.invalidateQueries(['activeGames']);
      queryClient.invalidateQueries(['gameStats']);
      
      // Verificar si se agotaron los intentos
      const hasNoAttemptsLeft = data.data.attemptsLeft === 0 || 
                               data.data.levelLocked === true ||
                               data.data.message?.includes('Límite de intentos alcanzado');
      
      if (hasNoAttemptsLeft) {
        // Forzar actualización inmediata del cache para reflejar el estado inactivo
        queryClient.refetchQueries(['activeGames']);
        queryClient.refetchQueries(['levels', gameSetId]);
        queryClient.refetchQueries(['progress', gameSetId]);
        queryClient.refetchQueries(['gameStats']);
      }
      
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

  // Reiniciar juego usando el código compartido original
  const restartGameMutation = useMutation({
    mutationFn: async ({ shareCode }) => {
      if (!shareCode) {
        throw new Error('Este juego no tiene un código de compartición válido');
      }
      return apiService.joinGame(shareCode);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['levels']);
      queryClient.invalidateQueries(['progress']);
      queryClient.invalidateQueries(['prize']);
      queryClient.invalidateQueries(['activeGames']);
      queryClient.invalidateQueries(['gameStats']);
      const newGameSet = response.data.data.gameSet;
      Alert.alert('🎮 ¡Juego Reiniciado!', `Se ha creado un nuevo juego con ${newGameSet.totalLevels} niveles`);
      return newGameSet;
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;
      if (message.includes('no válido') || message.includes('expirado')) {
        Alert.alert(
          'Código Inactivo',
          'El código de este juego ya no está activo. Pide a tu pareja que genere uno nuevo.',
          [{ text: 'Entendido' }]
        );
      } else if (message.includes('tu propio código')) {
        Alert.alert(
          'Acción No Permitida',
          'No puedes reiniciar un juego creado con tus propios datos. Únete a un juego compartido por otra persona.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('Error', message);
      }
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
    restartGame: restartGameMutation.mutateAsync,
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
