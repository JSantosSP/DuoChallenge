/**
 * @file ChallengeInput.js - Input adaptable según tipo de reto
 * @description Componente que renderiza diferentes inputs según tipo: texto, fecha, foto o lugar
 */

import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getImageUrl } from '../api/api';
import PuzzleGame from './PuzzleGame';
import { colors } from '../utils/colors';

/**
 * Input especializado que cambia según el tipo de reto
 * @param {Object} props
 * @param {('texto'|'fecha'|'foto'|'lugar')} props.type - Tipo de input
 * @param {string} props.value - Valor actual del input
 * @param {Function} props.onChangeText - Callback al cambiar texto
 * @param {Object} [props.challenge] - Datos del reto (necesario para tipo foto)
 * @param {Function} [props.onPuzzleComplete] - Callback al completar puzzle
 * @param {Object} [props.style] - Estilos adicionales
 * @returns {JSX.Element}
 */
const ChallengeInput = ({ type, value, onChangeText, challenge, onPuzzleComplete, style }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
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
      return (
        <View style={[styles.input, style, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.errorText}>No hay imagen disponible para este puzzle</Text>
        </View>
      );
    
    case 'lugar':
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
    borderColor: colors.neutral.border,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
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
    backgroundColor: colors.forest.medium,
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
