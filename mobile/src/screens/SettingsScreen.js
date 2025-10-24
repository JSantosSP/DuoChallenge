import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useGame, useGameShare } from '../hooks/useGame';
import AppButton from '../components/AppButton';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { stats, restartGame } = useGame();
  const { shareCodes, codesLoading, refetchCodes } = useGameShare();
  const [showShareCodeModal, setShowShareCodeModal] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartGame = async () => {
    await refetchCodes();
    const activeCodes = shareCodes?.filter(s => s.active) || [];
    
    if (activeCodes.length === 0) {
      Alert.alert(
        'No hay códigos disponibles',
        'No tienes códigos activos disponibles para reiniciar un juego. Pide a tu pareja que genere un código nuevo.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    setShowShareCodeModal(true);
  };

  const handleSelectShareCode = async (code) => {
    setShowShareCodeModal(false);
    
    Alert.alert(
      'Confirmar reinicio',
      `¿Quieres crear un nuevo juego usando el código ${code}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear juego',
          onPress: async () => {
            try {
              setIsRestarting(true);
              await restartGame({ shareCode: code });
              Alert.alert(
                '✅ ¡Juego creado!',
                'Se ha generado un nuevo juego. Puedes empezar a jugar.',
                [{ text: 'Ir al inicio', onPress: () => navigation.navigate('Home') }]
              );
            } catch (error) {
              console.error('Error creating game:', error);
            } finally {
              setIsRestarting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rol:</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'admin' ? '👑 Admin' : '🎮 Jugador'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.card}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Juegos Completados</Text>
              <Text style={styles.statValue}>
                {stats?.completedGames || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Juegos Activos</Text>
              <Text style={styles.statValue}>
                {stats?.activeGames || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Niveles Completados</Text>
              <Text style={styles.statValue}>
                {stats?.totalLevelsCompleted || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Premios Ganados</Text>
              <Text style={styles.statValue}>
                {stats?.prizesWon || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>


          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('Share')}
          >
            <Text style={styles.actionIcon}>🔗</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Comparte tus retos</Text>
              <Text style={styles.actionDescription}>
                Compartir tus retos personalizados con amigos
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('MyData')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Mis Datos Personales</Text>
              <Text style={styles.actionDescription}>
                Gestiona la información para tus retos
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('MyPrizes')}
          >
            <Text style={styles.actionIcon}>🎁</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Mis Premios</Text>
              <Text style={styles.actionDescription}>
                Gestiona tus premios personalizados
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={handleRestartGame}
            disabled={isRestarting}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Reiniciar Juego</Text>
              <Text style={styles.actionDescription}>
                Elige un código compartido y crea un nuevo juego
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Cerrar Sesión</Text>
              <Text style={styles.actionDescription}>
                Salir de la aplicación
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutEmoji}>❤️</Text>
            <Text style={styles.aboutText}>
              Hecho con amor para ti
            </Text>
            <Text style={styles.aboutVersion}>Versión 1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Share Code Selection Modal */}
      <Modal
        visible={showShareCodeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShareCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un código</Text>
              <TouchableOpacity 
                onPress={() => setShowShareCodeModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {codesLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#FF6B9D" />
                <Text style={styles.modalLoadingText}>Cargando códigos...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {shareCodes?.filter(s => s.active).map((shareCode) => (
                  <TouchableOpacity
                    key={shareCode._id}
                    style={styles.shareCodeCard}
                    onPress={() => handleSelectShareCode(shareCode.code)}
                  >
                    <View style={styles.shareCodeInfo}>
                      <Text style={styles.shareCodeCode}>{shareCode.code}</Text>
                      <Text style={styles.shareCodeMeta}>
                        Usado por {shareCode.usedBy?.length || 0} personas
                      </Text>
                      <Text style={styles.shareCodeDate}>
                        Creado: {new Date(shareCode.createdAt).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                    <Text style={styles.shareCodeArrow}>→</Text>
                  </TouchableOpacity>
                ))}
                {(!shareCodes || shareCodes.filter(s => s.active).length === 0) && (
                  <View style={styles.modalEmpty}>
                    <Text style={styles.modalEmptyText}>
                      No tienes códigos activos disponibles
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    padding: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666666',
  },
  modalScroll: {
    padding: 20,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  shareCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE4ED',
  },
  shareCodeInfo: {
    flex: 1,
  },
  shareCodeCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
    letterSpacing: 2,
  },
  shareCodeMeta: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  shareCodeDate: {
    fontSize: 12,
    color: '#999999',
  },
  shareCodeArrow: {
    fontSize: 24,
    color: '#FF6B9D',
    marginLeft: 12,
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default SettingsScreen;