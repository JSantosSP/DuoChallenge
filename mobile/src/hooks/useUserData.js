import { useState, useEffect } from 'react';
import { apiService } from '../api/api';
import { Alert } from 'react-native';

export const useUserData = () => {
  const [userData, setUserData] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos del usuario
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserData();
      setUserData(response.data.data.userData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos disponibles
  const fetchAvailableTypes = async () => {
    try {
      const response = await apiService.getAvailableTypes();
      setAvailableTypes(response.data.data.variables || []);
    } catch (error) {
      console.error('Error fetching available types:', error);
    }
  };

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Crear nuevo dato
  const createUserData = async (data) => {
    try {
      setLoading(true);
      const response = await apiService.createUserData(data);
      await fetchUserData(); // Recargar lista
      return { success: true, data: response.data.data.userDataItem };
    } catch (error) {
      console.error('Error creating user data:', error);
      const message = error.response?.data?.message || 'Error al crear dato';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar dato
  const updateUserData = async (id, data) => {
    try {
      setLoading(true);
      const response = await apiService.updateUserData(id, data);
      await fetchUserData(); // Recargar lista
      return { success: true, data: response.data.data.userDataItem };
    } catch (error) {
      console.error('Error updating user data:', error);
      const message = error.response?.data?.message || 'Error al actualizar dato';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar dato
  const deleteUserData = async (id) => {
    try {
      setLoading(true);
      await apiService.deleteUserData(id);
      await fetchUserData(); // Recargar lista
      return { success: true };
    } catch (error) {
      console.error('Error deleting user data:', error);
      const message = error.response?.data?.message || 'Error al eliminar dato';
      Alert.alert('Error', message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Subir imagen
  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await apiService.uploadImage(formData);
      // Devolver fullUrl para usar directamente en Image component
      return { 
        success: true, 
        path: response.data.data.path,
        fullUrl: response.data.data.fullUrl 
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      const message = error.response?.data?.message || 'Error al subir imagen';
      Alert.alert('Error', message);
      return { success: false, message };
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchUserData();
    fetchAvailableTypes();
    fetchCategories();
  }, []);

  return {
    userData,
    availableTypes,
    categories,
    loading,
    error,
    fetchUserData,
    createUserData,
    updateUserData,
    deleteUserData,
    uploadImage,
    refetch: fetchUserData
  };
};

// Hook para un dato específico
export const useUserDataItem = (id) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getUserData();
      const foundItem = response.data.data.userData.find(item => item._id === id);
      setItem(foundItem || null);
    } catch (error) {
      console.error('Error fetching user data item:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  return { item, loading, refetch: fetchItem };
};


