import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

const ProgressBar = ({ progress = 0, total = 100 }) => {
  const percentage = Math.round((progress / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Progreso General</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.info}>
        {progress} de {total} retos completados
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: colors.forest.medium,
    fontWeight: '700',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.forest.medium,
    borderRadius: 4,
  },
  info: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});
export default ProgressBar;
