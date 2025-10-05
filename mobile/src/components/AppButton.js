import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

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
      bg: '#FF6B9D',
      text: '#FFFFFF',
    },
    secondary: {
      bg: '#FFC2D4',
      text: '#333333',
    },
    outline: {
      bg: 'transparent',
      text: '#FF6B9D',
      border: '#FF6B9D',
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