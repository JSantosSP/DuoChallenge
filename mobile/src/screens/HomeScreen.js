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
import { useGame, useWonPrizes } from '../hooks/useGame';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { colors } from '../utils/colors';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    activeGames, 
    activeGamesLoading,
    stats,
    refetchActiveGames,
    refetchStats,
    generateGame,
    getHistory
  } = useGame();

  const { wonPrizes, refetch: refetchWonPrizes } = useWonPrizes();
  const [gameHistory, setGameHistory] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  // Fetch game history
  const fetchGameHistory = async () => {
    try {
      const history = await getHistory('completed');
      setGameHistory(history || []);
    } catch (error) {
      console.error('Error fetching game history:', error);
      setGameHistory([]);
    }
  };

  // Refresh data when screen becomes visible
  useFocusEffect(
    React.useCallback(() => {
      refetchActiveGames();
      refetchStats();
      refetchWonPrizes();
      fetchGameHistory();
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
    await Promise.all([
      refetchActiveGames(), 
      refetchStats(), 
      refetchWonPrizes(),
      fetchGameHistory()
    ]);
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
    return <LoadingOverlay message="Cargando dashboard..." />;
  }

  const hasActiveGames = activeGames && activeGames.length > 0;
  const hasWonPrizes = wonPrizes && wonPrizes.length > 0;
  const hasHistory = gameHistory && gameHistory.length > 0;

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
            Tu dashboard de juegos y premios
          </Text>
        </View>

        {/* Stats Card - Always visible */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completedGames || 0}</Text>
              <Text style={styles.statLabel}>Completados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.prizesWon || 0}</Text>
              <Text style={styles.statLabel}>Premios</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeGames || 0}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
          </View>
        )}

        {/* My Prizes Section - Always visible */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎁 Mis Premios</Text>
            {hasWonPrizes && (
              <TouchableOpacity onPress={() => navigation.navigate('WonPrizes')}>
                <Text style={styles.seeAllText}>Ver todos →</Text>
              </TouchableOpacity>
            )}
          </View>
          {hasWonPrizes ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {wonPrizes.slice(0, 3).map((prize, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.prizeCard}
                  onPress={() => navigation.navigate('WonPrizes')}
                >
                  <Text style={styles.prizeEmoji}>🏆</Text>
                  <Text style={styles.prizeTitle} numberOfLines={1}>
                    {prize.title}
                  </Text>
                  {prize.used && (
                    <Text style={styles.prizeUsed}>✓ Canjeado</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                Aún no tienes premios ganados. ¡Completa juegos para ganar premios!
              </Text>
            </View>
          )}
        </View>

        {/* Active Games Section - Always visible */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🕹️ Juegos Activos</Text>
          </View>
          {hasActiveGames ? (
            <>
              {activeGames.map((game) => (
                <TouchableOpacity
                  key={game._id}
                  style={styles.gameCard}
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
            </>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No tienes juegos activos. ¡Únete a uno o genera uno nuevo!
              </Text>
            </View>
          )}
        </View>

        {/* Game History Section - Always visible */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧾 Historial de Juegos</Text>
            {hasHistory && (
              <TouchableOpacity onPress={() => navigation.navigate('GameHistory')}>
                <Text style={styles.seeAllText}>Ver todos →</Text>
              </TouchableOpacity>
            )}
          </View>
          {hasHistory ? (
            <>
              {gameHistory.slice(0, 3).map((game) => (
                <View key={game._id} style={styles.historyCard}>
                  <Text style={styles.historyIcon}>
                    {game.shareCode ? '🔗' : '🎮'}
                  </Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyType}>
                      {getGameTypeLabel(game)}
                    </Text>
                    <Text style={styles.historyDate}>
                      Finalizado: {formatDate(game.completedAt || game.startedAt)}
                    </Text>
                  </View>
                  <View style={styles.historyStatus}>
                    <Text style={styles.historyProgress}>{game.progress || 0}%</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No has completado juegos aún. ¡Empieza uno para ver tu historial!
              </Text>
            </View>
          )}
        </View>

        {/* Game Actions Section - Always visible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Acciones de Juego</Text>
          <AppButton
            title="Unirse a un Juego"
            onPress={handleUnirse}
            icon="🔗"
            style={styles.actionButton}
          />
          <AppButton
            title="Generar Mi Juego"
            onPress={handleGenerateGame}
            variant="secondary"
            icon="✨"
            style={styles.actionButton}
          />
        </View>

        {/* Additional Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Más Opciones</Text>
          <AppButton
            title="Mis Datos Personales"
            onPress={() => navigation.navigate('MyData')}
            variant="outline"
            icon="📝"
            style={styles.actionButton}
          />
          <AppButton
            title="Mis Premios (Creados)"
            onPress={() => navigation.navigate('MyPrizes')}
            variant="outline"
            icon="🎁"
            style={styles.actionButton}
          />
        </View>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.textLight,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.muted,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.textLight,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.forest.medium,
    fontWeight: '600',
  },
  emptySection: {
    backgroundColor: colors.neutral.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.neutral.muted,
    textAlign: 'center',
    lineHeight: 20,
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
    color: colors.forest.medium,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.neutral.muted,
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
    borderColor: colors.forest.medium,
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.ocean.light,
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
    color: colors.neutral.textLight,
    marginBottom: 4,
  },
  gameProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.forest.medium,
    marginBottom: 2,
  },
  gameLevels: {
    fontSize: 13,
    color: colors.neutral.muted,
    marginBottom: 2,
  },
  gameDate: {
    fontSize: 12,
    color: colors.neutral.muted,
  },
  gameArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: colors.forest.medium,
  },
  actionButton: {
    marginBottom: 12,
  },
  prizeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prizeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  prizeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  prizeUsed: {
    fontSize: 11,
    color: colors.status.success,
    fontWeight: '600',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.textLight,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: colors.neutral.muted,
  },
  historyStatus: {
    marginLeft: 8,
  },
  historyProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.forest.medium,
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
    color: colors.neutral.textLight,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.muted,
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
    backgroundColor: colors.neutral.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.neutral.muted,
  },
});

export default HomeScreen;
