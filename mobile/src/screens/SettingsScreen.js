import React,  { useState } from 'react';
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
import { useGame } from '../hooks/useGame';
import AppButton from '../components/AppButton';
import { useShare } from '../hooks/useShare';
import { colors } from '../utils/colors';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { stats, restartGame, activeGames, refetchActiveGames } = useGame();
  const { fetchUsedShareCodes, usedShareCodes } = useShare();
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [availableShareCodes, setAvailableShareCodes] = useState([]);

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

  const handleRestartGame = async () => {
    // Refrescar juegos activos
    await fetchUsedShareCodes();
    console.log(usedShareCodes)

    
    // Obtener códigos únicos de juegos compartidos
    const shareCodes = [];
    const seenCodes = new Set();
    
    (usedShareCodes || []).forEach(code => {
      if (code.code && code._id && !seenCodes.has(code.code)) {
        seenCodes.add(code.code);
        shareCodes.push({
          code: code.code,
          creatorId: code.creatorId,
          shareId: code._id,
        });
      }
    });

    if (shareCodes.length === 0) {
      Alert.alert(
        'No hay códigos disponibles',
        'No tienes códigos compartidos disponibles para reiniciar un juego. Únete a un juego primero en la sección "Unirse a Juego".',
        [{ text: 'Entendido' }]
      );
      return;
    }

    setAvailableShareCodes(shareCodes);
    setShowRestartModal(true);
  };

  const handleSelectShareCode = async (shareCodeObj) => {
    setShowRestartModal(false);
    
    Alert.alert(
      'Reiniciar Juego',
      `¿Quieres crear un nuevo juego usando el código de ${shareCodeObj.creatorId?.name || 'tu pareja'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: async () => {
            try {
              setRestarting(true);
              await restartGame({ shareCode: shareCodeObj.code });
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error('Error restarting game:', error);
            } finally {
              setRestarting(false);
            }
          },
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
            onPress={handleRestartGame}
            disabled={restarting}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Reiniciar Juego</Text>
              <Text style={styles.actionDescription}>
                Genera un nuevo juego desde un código compartido
              </Text>
            </View>
          </TouchableOpacity>

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

      {/* Restart Game Modal */}
      <Modal
        visible={showRestartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRestartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un Código</Text>
              <TouchableOpacity
                onPress={() => setShowRestartModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {availableShareCodes.length > 0 ? (
                availableShareCodes.map((shareCode, index) => (
                  <TouchableOpacity
                    key={shareCode.code || index}
                    style={styles.shareCodeCard}
                    onPress={() => handleSelectShareCode(shareCode)}
                  >
                    <View style={styles.shareCodeHeader}>
                      <Text style={styles.shareCodeTitle}>
                        {shareCode.creatorId?.name || 'Desconocido'}
                      </Text>
                      <View style={styles.shareCodeBadge}>
                        <Text style={styles.shareCodeBadgeText}>Disponible</Text>
                      </View>
                    </View>
                    <Text style={styles.shareCodeCode}>{shareCode.code}</Text>
                    <Text style={styles.shareCodeInfo}>
                      Toca para generar un nuevo juego con este código
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyModalState}>
                  <Text style={styles.emptyModalEmoji}>🎮</Text>
                  <Text style={styles.emptyModalText}>
                    No hay códigos disponibles. Únete a un juego primero.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {restarting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.forest.medium} />
            <Text style={styles.loadingText}>Reiniciando juego...</Text>
          </View>
        </View>
      )}
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
    borderBottomColor: colors.neutral.border,
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
    color: colors.forest.medium,
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
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
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
  modalContent: {
    padding: 20,
  },
  shareCodeCard: {
    backgroundColor: colors.neutral.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.forest.medium,
  },
  shareCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  shareCodeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shareCodeBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shareCodeCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.forest.medium,
    marginBottom: 4,
    letterSpacing: 2,
  },
  shareCodeInfo: {
    fontSize: 14,
    color: '#666666',
  },
  emptyModalState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyModalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
});

export default SettingsScreen;
