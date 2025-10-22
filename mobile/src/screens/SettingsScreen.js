import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../hooks/useGame';
import AppButton from '../components/AppButton';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { resetGame, stats } = useGame();

  const handleResetGame = () => {
    Alert.alert(
      'Reiniciar Juego',
      '¿Estás seguro? Se perderá todo el progreso actual y se generarán nuevos retos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => resetGame(),
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
          
          <TouchableOpacity style={styles.actionCard} onPress={handleResetGame}>
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Reiniciar Juego</Text>
              <Text style={styles.actionDescription}>
                Genera nuevos retos y empieza de cero
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
});

export default SettingsScreen;