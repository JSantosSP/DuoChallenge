import React, { useState, useEffect } from 'react';
import { colors } from '../utils/colors';
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
import * as ImagePicker from 'expo-image-picker';
import { usePrize } from '../hooks/usePrize';
import { getImageUrl } from '../api/api';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const EditPrizeScreen = ({ navigation, route }) => {
  const { template, prize } = route.params || {};
  const isEditing = !!prize;
  const isFromTemplate = !!template;
  
  const { 
    createPrizeFromTemplate, 
    createPrize, 
    updatePrize, 
    uploadImage,
    loading 
  } = usePrize();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imagePath: null,
    weight: 1,
  });

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isEditing && prize) {
      setFormData({
        title: prize.title || '',
        description: prize.description || '',
        imagePath: prize.imagePath || null,
        weight: prize.weight || 1,
      });
      if (prize.imagePath) {
        setSelectedImage({ uri: getImageUrl(prize.imagePath) });
      }
    } else if (isFromTemplate && template) {
      setFormData({
        title: template.title || '',
        description: template.description || '',
        imagePath: template.imagePath || null,
        weight: template.weight || 1,
      });
      if (template.imagePath) {
        setSelectedImage({ uri: getImageUrl(template.imagePath) });
      }
    }
  }, [isEditing, prize, isFromTemplate, template]);

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({ uri: asset.uri });
        
        // Upload image
        const uploadResult = await uploadImage(asset.uri);
        if (uploadResult.success) {
          // Store path in DB, use fullUrl for immediate display
          setFormData({ ...formData, imagePath: uploadResult.path });
          setSelectedImage({ uri: uploadResult.fullUrl });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('ImagePicker Error:', error);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (formData.weight < 1 || formData.weight > 10) {
      Alert.alert('Error', 'El peso debe estar entre 1 y 10');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let result;
      if (isEditing) {
        result = await updatePrize(prize._id, formData);
      } else if (isFromTemplate) {
        result = await createPrizeFromTemplate(template._id, formData);
      } else {
        result = await createPrize(formData);
      }

      if (result.success) {
        Alert.alert(
          'Éxito',
          isEditing ? 'Premio actualizado correctamente' : 'Premio creado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el premio');
    }
  };

  const getWeightColor = (weight) => {
    if (weight <= 3) return '#4CAF50'; // Verde
    if (weight <= 6) return colors.status.warning; // Naranja
    return colors.status.error; // Rojo
  };

  if (loading) {
    return <LoadingOverlay message="Guardando..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Premio' : isFromTemplate ? 'Personalizar Plantilla' : 'Nuevo Premio'}
          </Text>
          {isFromTemplate && (
            <Text style={styles.subtitle}>
              Basado en: {template.title}
            </Text>
          )}
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del premio"
            value={formData.title}
            onChangeText={(value) => setFormData({ ...formData, title: value })}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu premio..."
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Image */}
        <View style={styles.section}>
          <Text style={styles.label}>Imagen</Text>
          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image source={selectedImage} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={handleImagePicker}
              >
                <Text style={styles.changeImageText}>Cambiar imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
              <Text style={styles.imageButtonText}>📸 Seleccionar imagen</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.label}>Peso (1-10)</Text>
          <Text style={styles.weightDescription}>
            Un peso mayor significa que este premio tiene más probabilidad de ser seleccionado
          </Text>
          <View style={styles.weightContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((weight) => (
              <TouchableOpacity
                key={weight}
                style={[
                  styles.weightButton,
                  { backgroundColor: getWeightColor(weight) },
                  formData.weight === weight && styles.weightActive
                ]}
                onPress={() => setFormData({ ...formData, weight })}
              >
                <Text style={[
                  styles.weightText,
                  formData.weight === weight && styles.weightTextActive
                ]}>
                  {weight}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.weightIndicator}>
            Peso seleccionado: {formData.weight}
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.section}>
          <AppButton
            title={isEditing ? 'Actualizar Premio' : 'Crear Premio'}
            onPress={handleSave}
            icon={isEditing ? '💾' : '🎁'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.backgroundLight,
  },
  scroll: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: colors.forest.medium,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  weightDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  weightContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  weightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weightActive: {
    borderColor: '#333333',
    transform: [{ scale: 1.1 }],
  },
  weightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weightTextActive: {
    color: '#FFFFFF',
  },
  weightIndicator: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default EditPrizeScreen;
