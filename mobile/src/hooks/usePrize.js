import { useState, useEffect } from 'react';
import { apiService } from '../api/api';
import { Alert } from 'react-native';

export const usePrize = () => {
  const [prizeTemplates, setPrizeTemplates] = useState([]);
  const [userPrizes, setUserPrizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar plantillas de premios
  const fetchPrizeTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrizeTemplates();
      setPrizeTemplates(response.data.data.templates || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching prize templates:', error);
      setError(error.response?.data?.message || 'Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar premios del usuario
  const fetchUserPrizes = async () => {
    try {
      setLoading(true);
      const resUserP = await apiService.getUserPrizes();
      const { userPrizes } = resUserP.data.data;
      setUserPrizes(userPrizes || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching user prizes:', error);
      setError(error.response?.data?.message || 'Error al cargar premios');
    } finally {
      setLoading(false);
    }
  };

  // Crear premio desde plantilla
  const createPrizeFromTemplate = async (templateId, customizations = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getPrizeTemplateById(templateId);
      const template = response.data.data.template;
      
      const prizeData = {
        title: customizations.title || template.title,
        description: customizations.description || template.description,
        imagePath: customizations.imagePath || template.imagePath,
        weight: customizations.weight || template.weight || 1,
        category: customizations.category || 'personal',
      };

      const createResponse = await apiService.createPrize(prizeData);
      await fetchUserPrizes(); // Recargar lista
      return { success: true, data: createResponse.data.data.prize };
    } catch (error) {
      console.error('Error creating prize from template:', error);
      const message = error.response?.data?.message || 'Error al crear premio';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Crear premio desde cero
  const createPrize = async (data) => {
    try {
      setLoading(true);
      const response = await apiService.createPrize(data);
      await fetchUserPrizes(); // Recargar lista
      return { success: true, data: response.data.data.prize };
    } catch (error) {
      console.error('Error creating prize:', error);
      const message = error.response?.data?.message || 'Error al crear premio';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar premio
  const updatePrize = async (id, data) => {
    try {
      setLoading(true);
      const response = await apiService.updatePrize(id, data);
      await fetchUserPrizes(); // Recargar lista
      return { success: true, data: response.data.data.prize };
    } catch (error) {
      console.error('Error updating prize:', error);
      const message = error.response?.data?.message || 'Error al actualizar premio';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar premio
  const deletePrize = async (id) => {
    try {
      setLoading(true);
      await apiService.deletePrize(id);
      await fetchUserPrizes(); // Recargar lista
      return { success: true };
    } catch (error) {
      console.error('Error deleting prize:', error);
      const message = error.response?.data?.message || 'Error al eliminar premio';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Subir imagen para premio
  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await apiService.uploadImage(formData);
      return { success: true, path: response.data.data.path };
    } catch (error) {
      console.error('Error uploading image:', error);
      const message = error.response?.data?.message || 'Error al subir imagen';
      Alert.alert('Error', message);
      return { success: false, message };
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchPrizeTemplates();
    fetchUserPrizes();
  }, []);

  return {
    prizeTemplates,
    userPrizes,
    loading,
    error,
    fetchPrizeTemplates,
    fetchUserPrizes,
    createPrizeFromTemplate,
    createPrize,
    updatePrize,
    deletePrize,
    uploadImage,
    refetch: () => {
      fetchPrizeTemplates();
      fetchUserPrizes();
    }
  };
};

// Hook para un premio específico
export const usePrizeItem = (id) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getUserPrizes();
      const foundItem = response.data.data.allPrizes.find(item => item._id === id);
      setItem(foundItem || null);
    } catch (error) {
      console.error('Error fetching prize item:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  return { item, loading, refetch: fetchItem };
};


