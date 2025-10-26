import { useState, useEffect } from 'react';
import { apiService } from '../api/api';
import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export const useShare = () => {
  const [shareCodes, setShareCodes] = useState([]);
  const [usedShareCodes, setUsedShareCodes] = useState([]);
  const [gameInstances, setGameInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar códigos de compartir del usuario
  const fetchShareCodes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserShareCodes();
      setShareCodes(response.data.data.shareCodes || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching share codes:', error);
      setError(error.response?.data?.message || 'Error al cargar códigos');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsedShareCodes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserUsedShareCodes();
      setUsedShareCodes(response.data.data.shareCodes || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching share codes usados:', error);
      setError(error.response?.data?.message || 'Error al cargar códigos usados');
    } finally {
      setLoading(false);
    }
  };

  // Cargar instancias de juego activas
  const fetchGameInstances = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSharedGames();
      setGameInstances(response.data.data.games || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching game instances:', error);
      setError(error.response?.data?.message || 'Error al cargar instancias');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo código de compartir
  const createShareCode = async () => {
    try {
      setLoading(true);
      const response = await apiService.createShareCode();
      await fetchShareCodes(); // Recargar lista
      return { success: true, data: response.data.data.gameShare };
    } catch (error) {
      console.error('Error creating share code:', error);
      const message = error.response?.data?.message || 'Error al crear código';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Verificar código de compartir
  const verifyShareCode = async (code) => {
    try {
      const response = await apiService.verifyShareCode(code);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error verifying share code:', error);
      const message = error.response?.data?.message || 'Código inválido';
      return { success: false, message };
    }
  };

  // Unirse a juego con código
  const joinGame = async (code) => {
    try {
      setLoading(true);
      const response = await apiService.joinGame(code);
      await fetchGameInstances(); // Recargar lista de instancias
      return { success: true, data: response.data.data.gameSet };
    } catch (error) {
      console.error('Error joining game:', error);
      const message = error.response?.data?.message || 'Error al unirse al juego';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Desactivar código de compartir
  const deactivateShareCode = async (codeId) => {
    try {
      setLoading(true);
      await apiService.deactivateShareCode(codeId);
      await fetchShareCodes(); // Recargar lista
      return { success: true };
    } catch (error) {
      console.error('Error deactivating share code:', error);
      const message = error.response?.data?.message || 'Error al desactivar código';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Compartir código usando la API nativa
  const shareCode = async (code) => {
    try {
      const result = await Share.share({
        message: `¡Únete a mi juego en DuoChallenge! Código: ${code}`,
        title: 'DuoChallenge - Código de invitación',
      });
      
      if (result.action === Share.sharedAction) {
        return { success: true };
      } else if (result.action === Share.dismissedAction) {
        return { success: false, message: 'Compartir cancelado' };
      }
    } catch (error) {
      console.error('Error sharing code:', error);
      return { success: false, message: 'Error al compartir código' };
    }
  };

  // Copiar código al portapapeles
  const copyCodeToClipboard = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Copiado', 'Código copiado al portapapeles');
      return { success: true };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return { success: false, message: 'Error al copiar código' };
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchShareCodes();
    fetchGameInstances();
  }, []);

  return {
    shareCodes,
    usedShareCodes,
    gameInstances,
    loading,
    error,
    fetchShareCodes,
    fetchUsedShareCodes,
    fetchGameInstances,
    createShareCode,
    verifyShareCode,
    joinGame,
    deactivateShareCode,
    shareCode,
    copyCodeToClipboard,
    refetch: () => {
      fetchShareCodes();
      fetchGameInstances();
      fetchUsedShareCodes();
    }
  };
};

// Hook para verificar si el usuario puede generar códigos
export const useShareValidation = () => {
  const [canGenerate, setCanGenerate] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const checkCanGenerate = async () => {
    try {
      // Verificar si tiene UserData
      const userDataResponse = await apiService.getUserData();
      const userData = userDataResponse.data.data.userData || [];
      
      // Verificar si tiene premios
      const prizesResponse = await apiService.getUserPrizes();
      const prizes = prizesResponse.data.data.userPrizes || [];

      const hasUserData = userData.length > 0;
      const hasPrizes = prizes.length > 0;

      if (hasUserData && hasPrizes) {
        setCanGenerate(true);
        setValidationMessage('');
      } else if (!hasUserData && !hasPrizes) {
        setCanGenerate(false);
        setValidationMessage('Necesitas crear al menos un dato y un premio para generar códigos');
      } else if (!hasUserData) {
        setCanGenerate(false);
        setValidationMessage('Necesitas crear al menos un dato personalizado');
      } else if (!hasPrizes) {
        setCanGenerate(false);
        setValidationMessage('Necesitas crear al menos un premio');
      }
    } catch (error) {
      console.error('Error checking share validation:', error);
      setCanGenerate(false);
      setValidationMessage('Error al verificar requisitos');
    }
  };

  useEffect(() => {
    checkCanGenerate();
  }, []);

  return {
    canGenerate,
    validationMessage,
    checkCanGenerate,
  };
};


