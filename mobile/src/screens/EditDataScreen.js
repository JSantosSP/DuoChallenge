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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserData } from '../hooks/useGame';
import AppButton from '../components/AppButton';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../api/api';

const EditDataScreen = ({ route, navigation }) => {
  const { mode, dataItem } = route.params;
  const { availableTypes, createData, updateData, isCreating, isUpdating } = useUserData();

  const [formData, setFormData] = useState({
    tipoDato: '',
    valor: '',
    pregunta: '',
    pistas: ['', '', ''],
    categorias: [],
    imagePath: null,
  });

  const [selectedType, setSelectedType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (mode === 'edit' && dataItem) {
      setFormData({
        tipoDato: dataItem.tipoDato,
        valor: dataItem.valor,
        pregunta: dataItem.pregunta,
        pistas: [...dataItem.pistas, '', '', ''].slice(0, 3),
        categorias: dataItem.categorias || [],
        imagePath: dataItem.imagePath,
      });
      const type = availableTypes?.find(t => t.key === dataItem.tipoDato);
      setSelectedType(type);
      
      // Si es fecha, inicializar el date picker con el valor
      if (type?.type === 'date' && dataItem.valor) {
        try {
          setSelectedDate(new Date(dataItem.valor));
        } catch (error) {
          setSelectedDate(new Date());
        }
      }
    }
  }, [mode, dataItem, availableTypes]);

  const handleSubmit = () => {
    // Validaciones
    if (!formData.tipoDato) {
      Alert.alert('Error', 'Selecciona un tipo de dato');
      return;
    }
    if (!formData.valor) {
      Alert.alert('Error', 'Ingresa un valor');
      return;
    }
    if (!formData.pregunta) {
      Alert.alert('Error', 'Ingresa una pregunta');
      return;
    }

    // Filtrar pistas vacías
    const pistasFiltered = formData.pistas.filter(p => p.trim() !== '');

    const data = {
      ...formData,
      pistas: pistasFiltered,
    };

    if (mode === 'edit') {
      updateData({ id: dataItem._id, data }, {
        onSuccess: () => navigation.goBack(),
      });
    } else {
      createData(data, {
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
        name: 'userdata.jpg',
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

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      // Formatear a YYYY-MM-DD
      const formatted = date.toISOString().split('T')[0];
      setFormData({ ...formData, valor: formatted });
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Seleccionar fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderInputByType = () => {
    if (!selectedType) return null;

    switch (selectedType.type) {
      case 'date':
        return (
          <View>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !formData.valor && styles.placeholderText]}>
                {formatDateDisplay(formData.valor)}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="es-ES"
              />
            )}
            
            {Platform.OS === 'ios' && showDatePicker && (
              <View style={styles.iosButtonContainer}>
                <TouchableOpacity 
                  style={styles.iosButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      case 'number':
        return (
          <TextInput
            style={styles.input}
            placeholder="Número"
            value={formData.valor}
            onChangeText={(text) => setFormData({ ...formData, valor: text })}
            keyboardType="numeric"
          />
        );
      default:
        return (
          <TextInput
            style={styles.input}
            placeholder="Valor"
            value={formData.valor}
            onChangeText={(text) => setFormData({ ...formData, valor: text })}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          {/* Tipo de Dato */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de Dato *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
              {availableTypes?.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeChip,
                    formData.tipoDato === type.key && styles.typeChipSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, tipoDato: type.key });
                    setSelectedType(type);
                  }}
                  disabled={mode === 'edit'}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      formData.tipoDato === type.key && styles.typeChipTextSelected,
                    ]}
                  >
                    {type.key}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Pregunta */}
          <View style={styles.section}>
            <Text style={styles.label}>Pregunta *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="¿Qué pregunta quieres hacer?"
              value={formData.pregunta}
              onChangeText={(text) => setFormData({ ...formData, pregunta: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Valor/Respuesta */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Respuesta Correcta * {selectedType && `(${selectedType.type})`}
            </Text>
            {renderInputByType()}
          </View>

          {/* Pistas */}
          <View style={styles.section}>
            <Text style={styles.label}>Pistas (opcional, máximo 3)</Text>
            {formData.pistas.map((pista, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Pista ${index + 1}`}
                value={pista}
                onChangeText={(text) => {
                  const newPistas = [...formData.pistas];
                  newPistas[index] = text;
                  setFormData({ ...formData, pistas: newPistas });
                }}
              />
            ))}
          </View>

          {/* Categorías */}
          <View style={styles.section}>
            <Text style={styles.label}>Categorías (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Separadas por comas: amor, fechas, lugares"
              value={formData.categorias.join(', ')}
              onChangeText={(text) => {
                const cats = text.split(',').map(c => c.trim()).filter(c => c);
                setFormData({ ...formData, categorias: cats });
              }}
            />
          </View>

          {/* Imagen */}
          {selectedType?.type === 'image' && (
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
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Subiendo...' : '📷 Seleccionar Imagen'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Botones */}
          <View style={styles.actions}>
            <AppButton
              title={mode === 'edit' ? 'Actualizar' : 'Crear'}
              onPress={handleSubmit}
              loading={isCreating || isUpdating}
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
  typesScroll: {
    marginTop: 8,
  },
  typeChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: '#FF6B9D',
  },
  typeChipText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#666666',
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
  actions: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 12,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  placeholderText: {
    color: '#999999',
  },
  calendarIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  iosButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  iosButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  iosButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditDataScreen;