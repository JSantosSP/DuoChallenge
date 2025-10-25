import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const GameHistoryScreen = ({ navigation }) => {
  const { getHistory, stats, refetchStats } = useGame();
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'active', 'abandoned'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async (status = null) => {
    try {
      setLoading(true);
      const history = await getHistory(status);
      setGames(history || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(filter === 'all' ? null : filter);
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory(filter === 'all' ? null : filter);
    await refetchStats();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'active': return colors.status.warning;
      case 'abandoned': return colors.status.error;
      default: return '#999999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return '✓ Completado';
      case 'active': return '⏳ Activo';
      case 'abandoned': return '✕ Abandonado';
      default: return status;
    }
  };

  const getGameTypeLabel = (game) => {
    if (game.shareCode) {
      return `🔗 Compartido (${game.shareCode})`;
    }
    return '🎮 Propio';
  };

  const handleGamePress = (game) => {
    if (game.status === 'active') {
      navigation.navigate('GameDetail', { gameSet: game });
    }
  };

  const renderGameCard = (game) => (
    <TouchableOpacity
      key={game._id}
      style={styles.gameCard}
      onPress={() => handleGamePress(game)}
      disabled={game.status !== 'active'}
    >
      <View style={styles.gameHeader}>
        <Text style={styles.gameType}>{getGameTypeLabel(game)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(game.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(game.status)}</Text>
        </View>
      </View>

      <View style={styles.gameStats}>
        <View style={styles.gameStat}>
          <Text style={styles.gameStatLabel}>Progreso</Text>
          <Text style={styles.gameStatValue}>{game.progress || 0}%</Text>
        </View>
        <View style={styles.gameStat}>
          <Text style={styles.gameStatLabel}>Niveles</Text>
          <Text style={styles.gameStatValue}>
            {game.completedLevels?.length || 0}/{game.totalLevels || 0}
          </Text>
        </View>
      </View>

      <View style={styles.gameDates}>
        <Text style={styles.dateText}>
          Iniciado: {formatDate(game.startedAt)}
        </Text>
        {game.completedAt && (
          <Text style={styles.dateText}>
            Finalizado: {formatDate(game.completedAt)}
          </Text>
        )}
      </View>

      {game.status === 'completed' && game.prizeId && (
        <View style={styles.prizeIndicator}>
          <Text style={styles.prizeText}>🏆 Premio ganado</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <LoadingOverlay message="Cargando historial..." />;
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
          <Text style={styles.title}>Historial de Juegos</Text>
          {stats && (
            <Text style={styles.subtitle}>
              {stats.totalGames} juegos • {stats.completedGames} completados
            </Text>
          )}
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'completed' && styles.filterActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                ✓ Completados
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'active' && styles.filterActive]}
              onPress={() => setFilter('active')}
            >
              <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
                ⏳ Activos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'abandoned' && styles.filterActive]}
              onPress={() => setFilter('abandoned')}
            >
              <Text style={[styles.filterText, filter === 'abandoned' && styles.filterTextActive]}>
                ✕ Abandonados
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Games List */}
        <View style={styles.section}>
          {games.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>
                No hay juegos en esta categoría
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'completed' && 'Completa juegos para verlos aquí'}
                {filter === 'active' && 'No tienes juegos activos'}
                {filter === 'abandoned' && 'No tienes juegos abandonados'}
                {filter === 'all' && 'Aún no has jugado ningún juego'}
              </Text>
            </View>
          ) : (
            games.map((game) => renderGameCard(game))
          )}
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
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterActive: {
    backgroundColor: colors.forest.medium,
    borderColor: colors.forest.medium,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  gameCard: {
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
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gameStats: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  gameStat: {
    flex: 1,
  },
  gameStatLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  gameStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest.medium,
  },
  gameDates: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
  },
  prizeIndicator: {
    marginTop: 8,
    backgroundColor: colors.ocean.light,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  prizeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.status.warning,
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default GameHistoryScreen;
