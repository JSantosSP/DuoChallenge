import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getImageUrl } from '../api/api';
import PuzzleGame from './PuzzleGame';

/**
 * Componente genérico para entrada de respuestas de retos
 * Renderiza según el tipo de reto (text, date, photo)
 */
const ChallengeInput = ({ type, value, onChangeText, challenge, onPuzzleComplete, style }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  // Handler para cambio de fecha
  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      // Formatear a YYYY-MM-DD
      const formatted = date.toISOString().split('T')[0];
      onChangeText(formatted);
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
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

  // Renderizar según tipo de reto
  switch (type) {
    case 'fecha':
      return (
        <View>
          <TouchableOpacity 
            style={[styles.dateInput, style]}
            onPress={handleDatePress}
          >
            <Text style={[styles.dateText, !value && styles.placeholder]}>
              {formatDateDisplay(value)}
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
    
    case 'foto':
      // Puzzle interactivo
      if (challenge && challenge.imagePath) {
        return (
          <PuzzleGame
            imageUri={getImageUrl(challenge.imagePath)}
            gridSize={challenge.puzzleGrid || 3}
            onComplete={onPuzzleComplete}
            style={style}
          />
        );
      }
      // Fallback si no hay imagen
      return (
        <View style={[styles.input, style, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.errorText}>No hay imagen disponible para este puzzle</Text>
        </View>
      );
    
    case 'lugar':
      // Tipo lugar: entrada de texto con placeholder específico
      return (
        <TextInput
          style={[styles.input, style]}
          placeholder="Ej: Madrid, Parque del Retiro, Casa..."
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="words"
        />
      );
    
    case 'texto':
    default:
      // Tipo texto: entrada libre normalizada
      return (
        <TextInput
          style={[styles.input, style]}
          placeholder="Tu respuesta..."
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="sentences"
        />
      );
  }
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  placeholder: {
    color: '#999999',
  },
  calendarIcon: {
    fontSize: 24,
    marginLeft: 8,
  },
  iosButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
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
  errorText: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChallengeInput;
