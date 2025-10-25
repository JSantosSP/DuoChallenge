import React,  { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShare, useShareValidation } from '../hooks/useShare';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const ShareScreen = ({ navigation }) => {
  const { 
    shareCodes, 
    gameInstances, 
    loading, 
    createShareCode, 
    deactivateShareCode, 
    shareCode, 
    copyCodeToClipboard,
    refetch 
  } = useShare();
  
  const { canGenerate, validationMessage, checkCanGenerate } = useShareValidation();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await checkCanGenerate();
    setRefreshing(false);
  };

  const handleGenerateCode = async () => {
    if (!canGenerate) {
      Alert.alert('No puedes generar códigos', validationMessage);
      return;
    }

    try {
      const result = await createShareCode();
      if (result.success) {
        Alert.alert(
          '¡Código generado!',
          `Tu código es: ${result.data.code}`,
          [
            { text: 'Copiar', onPress: () => copyCodeToClipboard(result.data.code) },
            { text: 'Compartir', onPress: () => shareCode(result.data.code) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el código');
    }
  };

  const handleDeactivateCode = (codeId) => {
    Alert.alert(
      'Desactivar código',
      '¿Estás seguro de que quieres desactivar este código?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => deactivateCode(codeId),
        },
      ]
    );
  };

  const deactivateCode = async (codeId) => {
    try {
      const result = await deactivateShareCode(codeId);
      if (result.success) {
        Alert.alert('Éxito', 'Código desactivado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo desactivar el código');
    }
  };

  const handleShareCode = async (code) => {
    try {
      await shareCode(code);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código');
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await copyCodeToClipboard(code);
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar el código');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (active, expiresAt) => {
    if (!active) return colors.status.error; // Rojo - inactivo
    if (expiresAt && new Date() > new Date(expiresAt)) return colors.status.error; // Rojo - expirado
    return '#4CAF50'; // Verde - activo
  };

  const getStatusText = (active, expiresAt) => {
    if (!active) return 'Inactivo';
    if (expiresAt && new Date() > new Date(expiresAt)) return 'Expirado';
    return 'Activo';
  };

  if (loading && !refreshing) {
    return <LoadingOverlay message="Cargando códigos..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Compartir Juego</Text>
          <Text style={styles.subtitle}>
            Genera códigos para que otros jueguen con tus datos
          </Text>
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <AppButton
            title={canGenerate ? "Generar Nuevo Código" : "Generar Código"}
            onPress={handleGenerateCode}
            icon="🔗"
            disabled={!canGenerate}
          />
          {!canGenerate && (
            <Text style={styles.validationMessage}>{validationMessage}</Text>
          )}
        </View>

        {/* Active Codes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Códigos Activos</Text>
          {shareCodes.filter(code => code.active).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔗</Text>
              <Text style={styles.emptyTitle}>No tienes códigos activos</Text>
              <Text style={styles.emptyText}>
                Genera un código para empezar a compartir tu juego
              </Text>
            </View>
          ) : (
            shareCodes
              .filter(code => code.active)
              .map((code) => (
                <View key={code._id} style={styles.codeCard}>
                  <View style={styles.codeHeader}>
                    <Text style={styles.codeText}>{code.code}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(code.active, code.expiresAt) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(code.active, code.expiresAt)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.codeMeta}>
                    Creado: {formatDate(code.createdAt)}
                  </Text>
                  
                  {code.usedBy && code.usedBy.length > 0 && (
                    <Text style={styles.codeMeta}>
                      Usado por {code.usedBy.length} persona{code.usedBy.length > 1 ? 's' : ''}
                    </Text>
                  )}

                  <View style={styles.codeActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCopyCode(code.code)}
                    >
                      <Text style={styles.actionButtonText}>📋 Copiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleShareCode(code.code)}
                    >
                      <Text style={styles.actionButtonText}>📤 Compartir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deactivateButton]}
                      onPress={() => handleDeactivateCode(code._id)}
                    >
                      <Text style={styles.actionButtonText}>❌ Desactivar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* Inactive Codes */}
        {shareCodes.filter(code => !code.active).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Códigos Inactivos</Text>
            {shareCodes
              .filter(code => !code.active)
              .map((code) => (
                <View key={code._id} style={[styles.codeCard, styles.inactiveCard]}>
                  <View style={styles.codeHeader}>
                    <Text style={[styles.codeText, styles.inactiveText]}>{code.code}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.status.error }]}>
                      <Text style={styles.statusText}>Inactivo</Text>
                    </View>
                  </View>
                  <Text style={styles.codeMeta}>
                    Desactivado: {formatDate(code.updatedAt)}
                  </Text>
                </View>
              ))
            }
          </View>
        )}

        {/* Game Instances */}
        {gameInstances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Juegos Activos</Text>
            <Text style={styles.sectionSubtitle}>
              Juegos en los que estás participando
            </Text>
            {gameInstances.map((instance) => (
              <View key={instance._id} style={styles.instanceCard}>
                <View style={styles.instanceHeader}>
                  <Text style={styles.instanceTitle}>
                    Creado por: {instance.creatorId?.name || 'Usuario'}
                  </Text>
                  <Text style={styles.instanceCode}>
                    Código: {instance.shareCode}
                  </Text>
                </View>
                <Text style={styles.instanceMeta}>
                  Unido: {formatDate(instance.createdAt)}
                </Text>
                <Text style={styles.instanceMeta}>
                  Sets completados: {instance.completedSets}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  validationMessage: {
    fontSize: 14,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.forest.medium,
    fontFamily: 'monospace',
  },
  inactiveText: {
    color: '#999999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  codeMeta: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  codeActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    backgroundColor: colors.forest.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  deactivateButton: {
    backgroundColor: colors.status.error,
  },
  instanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  instanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  instanceCode: {
    fontSize: 14,
    color: colors.forest.medium,
    fontFamily: 'monospace',
  },
  instanceMeta: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ShareScreen;
