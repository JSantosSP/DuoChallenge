import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../hooks/useGame';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    activeGames, 
    activeGamesLoading,
    stats,
    refetchActiveGames,
    refetchStats,
    generateGame
  } = useGame();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Refresh data when screen becomes visible
  useFocusEffect(
    React.useCallback(() => {
      refetchActiveGames();
      refetchStats();
    }, [])
  );

  // Seleccionar automáticamente el primer juego activo
  useEffect(() => {
    if (activeGames && activeGames.length > 0 && !selectedGame) {
      setSelectedGame(activeGames[0]);
    }
  }, [activeGames]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchActiveGames(), refetchStats()]);
    setRefreshing(false);
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
  };

  const handlePlayGame = (game) => {
    navigation.navigate('GameDetail', { gameSet: game });
  };

  const handleUnirse = () => {
    navigation.navigate('JoinGame');
  };

  const handleGenerateGame = async () => {
    try {
      const newGameSet = await generateGame();
      if (newGameSet) {
        setSelectedGame(newGameSet);
        await refetchActiveGames();
      }
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGameTypeLabel = (game) => {
    if (game.shareCode) {
      return `🔗 Juego compartido (${game.shareCode})`;
    }
    return '🎮 Mi juego';
  };

  if (activeGamesLoading) {
    return <LoadingOverlay message="Cargando tus juegos..." />;
  }

  const hasActiveGames = activeGames && activeGames.length > 0;

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
          <Text style={styles.greeting}>¡Hola, {user?.name}! 💕</Text>
          <Text style={styles.subtitle}>
            {hasActiveGames 
              ? `Tienes ${activeGames.length} juego${activeGames.length !== 1 ? 's' : ''} activo${activeGames.length !== 1 ? 's' : ''}` 
              : 'Comienza tu primera aventura'}
          </Text>
        </View>

        {hasActiveGames ? (
          <>
            {/* Stats Card */}
            {stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.completedGames || 0}</Text>
                  <Text style={styles.statLabel}>Completados</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.prizesWon || 0}</Text>
                  <Text style={styles.statLabel}>Premios Ganados</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.activeGames || 0}</Text>
                  <Text style={styles.statLabel}>Activos</Text>
                </View>
              </View>
            )}

            {/* Active Games List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tus Juegos Activos</Text>
              {activeGames.map((game) => (
                <TouchableOpacity
                  key={game._id}
                  style={[
                    styles.gameCard,
                    selectedGame?._id === game._id && styles.gameCardSelected,
                  ]}
                  onPress={() => handlePlayGame(game)}
                >
                  <View style={styles.gameIcon}>
                    <Text style={styles.gameIconText}>
                      {game.shareCode ? '🔗' : '🎮'}
                    </Text>
                  </View>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameType}>
                      {getGameTypeLabel(game)}
                    </Text>
                    <Text style={styles.gameProgress}>
                      Progreso: {game.progress || 0}%
                    </Text>
                    <Text style={styles.gameLevels}>
                      {game.completedLevels?.length || 0} / {game.totalLevels || 0} niveles
                    </Text>
                    <Text style={styles.gameDate}>
                      Iniciado: {formatDate(game.startedAt)}
                    </Text>
                  </View>
                  <View style={styles.gameArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <AppButton
                title="Ver Premios Ganados"
                onPress={() => navigation.navigate('WonPrizes')}
                variant="secondary"
                icon="🏆"
                style={styles.actionButton}
              />
              <AppButton
                title="Ver Historial"
                onPress={() => navigation.navigate('GameHistory')}
                variant="outline"
                icon="📊"
                style={styles.actionButton}
              />
              <AppButton
                title="Unirse a un Juego"
                onPress={handleUnirse}
                variant="outline"
                icon="🔗"
                style={styles.actionButton}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyTitle}>¡Comienza tu Aventura!</Text>
            <Text style={styles.emptyText}>
              Únete a un juego existente con un código de invitación o genera tu propio juego para empezar a jugar.
            </Text>
            <AppButton
              title="Unirse a un Juego"
              onPress={handleUnirse}
              icon="🔗"
              style={styles.generateButton}
            />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.emptyText}>
              Genera tu propio juego para empezar a jugar.
            </Text>
            <AppButton
              title="Generar Mi Juego"
              onPress={handleGenerateGame}
              icon="✨"
              style={styles.generateButton}
            />
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
    paddingTop: 0,
  },
  greeting: {
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
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  gameCard: {
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
  gameCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameIconText: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  gameProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 2,
  },
  gameLevels: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  gameDate: {
    fontSize: 12,
    color: '#999999',
  },
  gameArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#FF6B9D',
  },
  actionButton: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 24,
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
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  generateButton: {
    minWidth: 200,
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 48,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999999',
  },
});

export default HomeScreen;
