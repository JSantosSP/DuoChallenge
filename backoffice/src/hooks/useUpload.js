import { useState } from 'react';
import api from '../api/axios';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    if (!file) return null;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentage);
        }
      });

      setUploading(false);
      return response.data.data.path;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir archivo');
      setUploading(false);
      return null;
    }
  };

  const generatePreview = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setProgress(0);
    setError(null);
  };

  return {
    uploadFile,
    uploading,
    progress,
    preview,
    generatePreview,
    clearPreview,
    error
  };
};