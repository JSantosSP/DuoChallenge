import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share as RNShare,
  RefreshControl,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameShare } from '../hooks/useGame';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const ShareScreen = ({ navigation }) => {
  const { 
    shareCodes, 
    codesLoading, 
    createCode, 
    deactivateCode,
    isCreatingCode,
    refetchCodes 
  } = useGameShare();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchCodes();
    setRefreshing(false);
  };

  const handleCreateCode = () => {
    createCode();
  };

  const handleShareCode = async (code) => {
    try {
      await RNShare.share({
        message: `¡Juega mi escape room personalizado! 🎮\n\nUsa este código: ${code}\n\n¡Completa todos los retos y descubre tu premio!`,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const handleCopyCode = (code) => {
    Clipboard.setString(code);
    Alert.alert('Copiado', 'Código copiado al portapapeles');
  };

  const handleDeactivate = (codeObj) => {
    Alert.alert(
      'Desactivar Código',
      '¿Estás seguro? Nadie más podrá usar este código.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => deactivateCode(codeObj._id),
        },
      ]
    );
  };

  if (codesLoading) {
    return <LoadingOverlay message="Cargando..." />;
  }

  const activeCodes = shareCodes?.filter(c => c.active) || [];
  const inactiveCodes = shareCodes?.filter(c => !c.active) || [];

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
          <Text style={styles.title}>Compartir mis Datos</Text>
          <Text style={styles.subtitle}>
            Genera un código para que otra persona juegue con tus datos personalizados
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
          <Text style={styles.infoText}>
            1. Genera un código único{'\n'}
            2. Compártelo con tu pareja{'\n'}
            3. Ella/él lo usa para crear un juego con tus datos{'\n'}
            4. ¡Disfruten juntos del escape room personalizado!
          </Text>
        </View>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          <AppButton
            title="Generar Código Nuevo"
            onPress={handleCreateCode}
            loading={isCreatingCode}
            icon="🎲"
          />
        </View>

        {/* Active Codes */}
        {activeCodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Código Activo</Text>
            {activeCodes.map((codeObj) => (
              <View key={codeObj._id} style={styles.codeCard}>
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLabel}>Código:</Text>
                  <Text style={styles.code}>{codeObj.code}</Text>
                </View>

                <View style={styles.codeStats}>
                  <Text style={styles.codeStat}>
                    📅 Creado: {new Date(codeObj.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.codeStat}>
                    👥 Usado por: {codeObj.usedBy?.length || 0} persona(s)
                  </Text>
                </View>

                {codeObj.usedBy && codeObj.usedBy.length > 0 && (
                  <View style={styles.usersContainer}>
                    <Text style={styles.usersLabel}>Jugadores:</Text>
                    {codeObj.usedBy.map((user, idx) => (
                      <Text key={idx} style={styles.userName}>
                        • {user.userId?.name || 'Usuario'}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.codeActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCopyCode(codeObj.code)}
                  >
                    <Text style={styles.actionButtonText}>📋 Copiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareCode(codeObj.code)}
                  >
                    <Text style={styles.actionButtonText}>📤 Compartir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deactivateButton]}
                    onPress={() => handleDeactivate(codeObj)}
                  >
                    <Text style={styles.deactivateButtonText}>🚫 Desactivar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Inactive Codes */}
        {inactiveCodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Códigos Anteriores</Text>
            {inactiveCodes.map((codeObj) => (
              <View key={codeObj._id} style={[styles.codeCard, styles.inactiveCodeCard]}>
                <Text style={styles.inactiveCode}>{codeObj.code}</Text>
                <Text style={styles.inactiveLabel}>Desactivado</Text>
              </View>
            ))}
          </View>
        )}

        {activeCodes.length === 0 && inactiveCodes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔗</Text>
            <Text style={styles.emptyTitle}>No tienes códigos aún</Text>
            <Text style={styles.emptyText}>
              Genera un código para compartir tus datos con otra persona
            </Text>
          </View>
        )}
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
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  infoCard: {
    margin: 24,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
    textAlign: 'center',
  },
  generateSection: {
    padding: 24,
    paddingTop: 0,
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
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666666',
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
    letterSpacing: 4,
  },
  codeStats: {
    marginBottom: 16,
  },
  codeStat: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  usersContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  usersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  deactivateButton: {
    backgroundColor: '#FFE0E0',
  },
  deactivateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D32F2F',
  },
  inactiveCodeCard: {
    opacity: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inactiveCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999999',
    letterSpacing: 2,
  },
  inactiveLabel: {
    fontSize: 12,
    color: '#999999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
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