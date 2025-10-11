import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

/**
 * Componente genérico para entrada de respuestas de retos
 * Renderiza según el tipo de reto (text, date, photo)
 */
const ChallengeInput = ({ type, value, onChangeText, style }) => {
  // Renderizar según tipo de reto
  switch (type) {
    case 'date':
      return (
        <TextInput
          style={[styles.input, style]}
          placeholder="YYYY-MM-DD (ej: 2020-06-15)"
          value={value}
          onChangeText={onChangeText}
          keyboardType="default"
          autoCapitalize="none"
        />
      );
    
    case 'photo':
      // Por ahora manejamos como texto, en el futuro podría ser un selector de imagen
      return (
        <TextInput
          style={[styles.input, style]}
          placeholder="Tu respuesta..."
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="sentences"
        />
      );
    
    case 'text':
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
});

export default ChallengeInput;
