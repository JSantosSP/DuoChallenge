/**
 * @file AppButton.js - Botón reutilizable con variantes
 * @description Botón estilizado con soporte para loading, iconos y múltiples variantes
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

/**
 * Botón personalizado con variantes de estilo
 * @param {Object} props
 * @param {string} props.title - Texto del botón
 * @param {Function} props.onPress - Callback al presionar
 * @param {boolean} [props.loading=false] - Muestra indicador de carga
 * @param {boolean} [props.disabled=false] - Deshabilita el botón
 * @param {('primary'|'secondary'|'outline')} [props.variant='primary'] - Estilo del botón
 * @param {string} [props.icon] - Emoji o texto para icono
 * @param {Object} [props.style] - Estilos adicionales
 * @returns {JSX.Element}
 */
const AppButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  icon,
  style
}) => {
  const variants = {
    primary: {
      bg: colors.forest.medium,
      text: '#FFFFFF',
    },
    secondary: {
      bg: colors.ocean.light,
      text: colors.neutral.textLight,
    },
    outline: {
      bg: 'transparent',
      text: colors.forest.medium,
      border: colors.forest.medium,
    },
  };

  const currentVariant = variants[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: currentVariant.bg },
        variant === 'outline' && { borderWidth: 2, borderColor: currentVariant.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.text} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, { color: currentVariant.text }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
});

export default AppButton;
