import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserPrizes } from '../hooks/useGame';
import AppButton from '../components/AppButton';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../api/api';

const EditPrizeScreen = ({ route, navigation }) => {
  const { mode, prize } = route.params;
  const { createPrize, updatePrize, isCreating, isUpdating } = useUserPrizes();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imagePath: null,
    weight: 5,
    category: 'personal',
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && prize) {
      setFormData({
        title: prize.title,
        description: prize.description,
        imagePath: prize.imagePath,
        weight: prize.weight,
        category: prize.category || 'personal',
      });
    }
  }, [mode, prize]);

  const handleSubmit = () => {
    // Validaciones
    if (!formData.title) {
      Alert.alert('Error', 'Ingresa un título para el premio');
      return;
    }
    if (!formData.description) {
      Alert.alert('Error', 'Ingresa una descripción');
      return;
    }

    const data = { ...formData };

    if (mode === 'edit') {
      updatePrize({ id: prize._id, data }, {
        onSuccess: () => navigation.goBack(),
      });
    } else {
      createPrize(data, {
        onSuccess: () => navigation.goBack(),
      });
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'prize.jpg',
      });

      const response = await apiService.uploadImage(formData);
      setFormData(prev => ({ ...prev, imagePath: response.data.data.path }));
      Alert.alert('Éxito', 'Imagen subida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.section}>
            <Text style={styles.label}>Título del Premio *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cena Romántica 🍝"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe el premio en detalle..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Imagen */}
          <View style={styles.section}>
            <Text style={styles.label}>Imagen (opcional)</Text>
            {formData.imagePath ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${formData.imagePath}` }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setFormData({ ...formData, imagePath: null })}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImage}
                disabled={uploading}
              >
                <Text style={styles.uploadEmoji}>📷</Text>
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Peso */}
          <View style={styles.section}>
            <Text style={styles.label}>Peso (Probabilidad 1-10)</Text>
            <Text style={styles.hint}>
              Mayor peso = mayor probabilidad de salir
            </Text>
            <View style={styles.weightContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.weightButton,
                    formData.weight === value && styles.weightButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, weight: value })}
                >
                  <Text
                    style={[
                      styles.weightButtonText,
                      formData.weight === value && styles.weightButtonTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoría</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: comida, relax, viaje..."
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
          </View>

          {/* Botones */}
          <View style={styles.actions}>
            <AppButton
              title={mode === 'edit' ? 'Actualizar Premio' : 'Crear Premio'}
              onPress={handleSubmit}
              loading={isCreating || isUpdating}
              icon="🎁"
            />
            <AppButton
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  scroll: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weightContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weightButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  weightButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  weightButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  weightButtonTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default EditPrizeScreen;