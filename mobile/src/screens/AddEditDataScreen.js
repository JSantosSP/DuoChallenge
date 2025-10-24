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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useUserData } from '../hooks/useUserData';
import { getImageUrl } from '../api/api';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const AddEditDataScreen = ({ navigation, route }) => {
  const { item } = route.params || {};
  const isEditing = !!item;
  
  const { 
    availableTypes, 
    categories, 
    createUserData, 
    updateUserData, 
    uploadImage,
    loading 
  } = useUserData();

  const [formData, setFormData] = useState({
    tipoDato: '',
    valor: {},
    pregunta: '',
    pistas: ['', '', ''], // Máximo 3 pistas
    categorias: '',
    difficulty: 'medium',
    puzzleGrid: 3,
    imagePath: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isEditing && item) {
      setFormData({
        tipoDato: item.tipoDato ,
        valor: item.valor || {},
        pregunta: item.pregunta || '',
        pistas: item.pistas && item.pistas.length > 0 ? [...item.pistas, ...Array(3 - item.pistas.length).fill('')] : ['', '', ''],
        categorias: item.categorias?._id || item.categorias,
        difficulty: item.difficulty || 'medium',
        puzzleGrid: item.puzzleGrid || 3,
        imagePath: item.imagePath || null,
      });
      if (item?.imagePath) {
        setSelectedImage({ uri: getImageUrl(item.imagePath) });
      }
    }
  }, [isEditing, item]);

  const getTypeIcon = (typeId) => {
    const type = availableTypes.find(t => t._id === typeId);
    switch (type?.type) {
      case 'texto': return '📝';
      case 'fecha': return '📅';
      case 'foto': return '📸';
      case 'lugar': return '📍';
      default: return '❓';
    }
  };

  const getTypeName = (typeId) => {
    const type = availableTypes.find(t => t._id === typeId);
    return type?.type || '';
  };

  const getTypePlaceholder = (typeId) => {
    const type = availableTypes.find(t => t._id === typeId);
    switch (type?.type) {
      case 'texto': return 'Escribe tu respuesta...';
      case 'fecha': return 'Selecciona una fecha';
      case 'lugar': return 'Escribe el lugar...';
      case 'foto': return 'Selecciona una imagen';
      default: return '';
    }
  };

  const handleTypeChange = (typeId) => {
    setFormData({
      ...formData,
      tipoDato: typeId,
      valor: {},
    });
    setSelectedImage(null);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData({ ...formData, valor: {fecha: dateString} });
    }
  };

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
          // Store path in imagePath field, use fullUrl for immediate display
          setFormData({ ...formData, imagePath: uploadResult.path });
          setSelectedImage({ uri: uploadResult.fullUrl });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('ImagePicker Error:', error);
    }
  };

  const handlePistaChange = (index, value) => {
    const newPistas = [...formData.pistas];
    newPistas[index] = value;
    setFormData({ ...formData, pistas: newPistas });
  };

  const validateForm = () => {
    if (!formData.tipoDato) {
      Alert.alert('Error', 'Selecciona un tipo de dato');
      return false;
    }
    
    const typeName = getTypeName(formData.tipoDato);
    
    // Validación específica para tipo foto
    if (typeName === 'foto') {
      if (!formData.imagePath) {
        Alert.alert('Error', 'Selecciona una imagen para el puzzle');
        return false;
      }
    } else {
      // Validación para otros tipos
      if (!formData.valor || (typeof formData.valor === 'object' && Object.keys(formData.valor).length === 0)) {
        Alert.alert('Error', 'El valor es requerido');
        return false;
      }
    }
    
    if (!formData.pregunta) {
      Alert.alert('Error', 'La pregunta es requerida');
      return false;
    }
    if (!formData.categorias) {
      Alert.alert('Error', 'Selecciona una categoría');
      return false;
    }

    const activePistas = formData.pistas.filter(p => p.trim() !== '');
    if (activePistas.length > 3) {
      Alert.alert('Error', 'Máximo 3 pistas permitidas');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const activePistas = formData.pistas.filter(p => p.trim() !== '');
    const typeName = getTypeName(formData.tipoDato);
    
    // Preparar datos según el tipo
    let submitData = {
      ...formData,
      pistas: activePistas,
    };
    
    // Para tipo foto, no necesitamos valor, solo imagePath
    if (typeName === 'foto') {
      submitData.valor = {}; // Valor vacío para tipo foto
    }

    try {
      let result;
      if (isEditing) {
        result = await updateUserData(item._id, submitData);
      } else {
        result = await createUserData(submitData);
      }

      if (result.success) {
        Alert.alert(
          'Éxito',
          isEditing ? 'Dato actualizado correctamente' : 'Dato creado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el dato');
    }
  };

  const renderValueInput = () => {
    const typeName = getTypeName(formData.tipoDato);

    switch (typeName) {
      case 'fecha':
        return (
          <View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formData.valor?.fecha || 'Seleccionar fecha'}
              </Text>
              <Text style={styles.dateButtonIcon}>📅</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.valor?.fecha ? new Date(formData.valor.fecha) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        );

      case 'foto':
        return (
          <View>
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
            
            <View style={styles.puzzleGridContainer}>
              <Text style={styles.label}>Tamaño del puzzle:</Text>
              <View style={styles.puzzleGridOptions}>
                {[3, 4, 5].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.puzzleGridOption,
                      formData.puzzleGrid === size && styles.puzzleGridActive
                    ]}
                    onPress={() => setFormData({ ...formData, puzzleGrid: size })}
                  >
                    <Text style={[
                      styles.puzzleGridText,
                      formData.puzzleGrid === size && styles.puzzleGridTextActive
                    ]}>
                      {size}x{size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        case 'lugar':
          return (
          <TextInput
            style={styles.input}
            placeholder={getTypePlaceholder(formData.tipoDato)}
            value={formData.valor.lugar || '' }
            onChangeText={(value) => setFormData({ ...formData, valor: {lugar: value} })}

          />
        );

      default:
        return (
          <TextInput
            style={styles.input}
            placeholder={getTypePlaceholder(formData.tipoDato)}
            value={formData.valor.texto || '' }
            onChangeText={(value) => setFormData({ ...formData, valor: {texto: value} })}
          />
        );
    }
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
            {isEditing ? 'Editar Dato' : 'Nuevo Dato'}
          </Text>
        </View>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de dato *</Text>
          <View style={styles.typeContainer}>
            {availableTypes.map((type) => (
              <TouchableOpacity
                key={type._id}
                style={[
                  styles.typeButton,
                  formData.tipoDato === type._id && styles.typeActive
                ]}
                onPress={() => handleTypeChange(type._id)}
              >
                <Text style={styles.typeIcon}>{getTypeIcon(type._id)}</Text>
                <Text style={[
                  styles.typeText,
                  formData.tipoDato === type._id && styles.typeTextActive
                ]}>
                  {type.type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Value Input */}
        {formData.tipoDato && (
          <View style={styles.section}>
            <Text style={styles.label}>Valor *</Text>
            {renderValueInput()}
          </View>
        )}

        {/* Question */}
        <View style={styles.section}>
          <Text style={styles.label}>Pregunta *</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Cuál es la pregunta que aparecerá en el juego?"
            value={formData.pregunta}
            onChangeText={(value) => setFormData({ ...formData, pregunta: value })}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Hints */}
        <View style={styles.section}>
          <Text style={styles.label}>Pistas (máximo 3)</Text>
          {formData.pistas.map((pista, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Pista ${index + 1} (opcional)`}
              value={pista}
              onChangeText={(value) => handlePistaChange(index, value)}
            />
          ))}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryButton,
                  formData.categorias === category._id && styles.categoryActive
                ]}
                onPress={() => setFormData({ ...formData, categorias: category._id })}
              >
                <Text style={[
                  styles.categoryText,
                  formData.categorias === category._id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.label}>Dificultad</Text>
          <View style={styles.difficultyContainer}>
            {[
              { value: 'easy', label: 'Fácil', icon: '🟢' },
              { value: 'medium', label: 'Medio', icon: '🟡' },
              { value: 'hard', label: 'Difícil', icon: '🔴' },
            ].map((diff) => (
              <TouchableOpacity
                key={diff.value}
                style={[
                  styles.difficultyButton,
                  formData.difficulty === diff.value && styles.difficultyActive
                ]}
                onPress={() => setFormData({ ...formData, difficulty: diff.value })}
              >
                <Text style={styles.difficultyIcon}>{diff.icon}</Text>
                <Text style={[
                  styles.difficultyText,
                  formData.difficulty === diff.value && styles.difficultyTextActive
                ]}>
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.section}>
          <AppButton
            title={isEditing ? 'Actualizar Dato' : 'Crear Dato'}
            onPress={handleSave}
            icon={isEditing ? '💾' : '➕'}
          />
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
  header: {
    padding: 24,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  typeActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  dateButtonIcon: {
    fontSize: 20,
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
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  puzzleGridContainer: {
    marginTop: 16,
  },
  puzzleGridOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  puzzleGridOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  puzzleGridActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  puzzleGridText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  puzzleGridTextActive: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  difficultyActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  difficultyIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  difficultyTextActive: {
    color: '#FFFFFF',
  },
});

export default AddEditDataScreen;

