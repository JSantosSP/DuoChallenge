import React, { useEffect } from 'react';
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
import { useGame } from '../hooks/useGame';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const GameDetailScreen = ({ route, navigation }) => {
  const { gameSet } = route.params;
  
  const { 
    levels, 
    levelsLoading, 
    progress, 
    refetchLevels,
    refetchProgress
  } = useGame(gameSet._id);

  const [refreshing, setRefreshing] = React.useState(false);

  // Refresh data when screen becomes visible
  useFocusEffect(
    React.useCallback(() => {
      refetchLevels();
      refetchProgress();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLevels(), refetchProgress()]);
    setRefreshing(false);
  };

  const getGameTypeLabel = () => {
    if (gameSet.shareCode) {
      return `🔗 Juego compartido (${gameSet.shareCode})`;
    }
    return '🎮 Mi juego';
  };

  const getChallengeTypeLabel = (type) => {
    const labels = {
      texto: '✏️ Texto',
      fecha: '📅 Fecha',
      foto: '🖼️ Puzzle',
      lugar: '📍 Lugar',
    };
    return labels[type] || '🎯 Reto';
  };

  if (levelsLoading && !refreshing) {
    return <LoadingOverlay message="Cargando niveles..." />;
  }

  const completedLevels = levels?.filter(l => l.completed).length || 0;
  const totalLevels = levels?.length || 0;
  const progressPercentage = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

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
          <Text style={styles.gameType}>{getGameTypeLabel()}</Text>
          {gameSet.status === 'completed' && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completado</Text>
            </View>
          )}
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <ProgressBar
            progress={completedLevels}
            total={totalLevels}
          />
          <Text style={styles.progressText}>
            {completedLevels} de {totalLevels} niveles completados ({Math.round(progressPercentage)}%)
          </Text>
        </View>

        {/* Levels List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveles</Text>
          {levels && levels.length > 0 ? (
            levels.map((level, index) => {
              const isLocked = index > 0 && !levels[index - 1]?.completed && !level.completed;
              
              return (
                <TouchableOpacity
                  key={level._id}
                  style={[
                    styles.levelCard,
                    level.completed && styles.levelCompleted,
                    isLocked && styles.levelLocked,
                  ]}
                  onPress={() => !isLocked && navigation.navigate('Level', { level, gameSetId: gameSet._id })}
                  disabled={isLocked}
                >
                  <View style={[
                    styles.levelIcon,
                    level.completed && styles.levelIconCompleted,
                    isLocked && styles.levelIconLocked,
                  ]}>
                    <Text style={styles.levelIconText}>
                      {level.completed ? '✅' : isLocked ? '🔒' : '🎯'}
                    </Text>
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelTitle}>Nivel {index + 1}</Text>
                    <Text style={styles.levelType}>
                      {getChallengeTypeLabel(level.tipoDato?.type)}
                    </Text>
                    {level.completed && level.completedAt && (
                      <Text style={styles.levelCompletedAt}>
                        ✓ Completado
                      </Text>
                    )}
                    {!level.completed && !isLocked && (
                      <Text style={styles.levelAttempts}>
                        Intentos: {level.currentAttempts || 0} / {level.maxAttempts || 5}
                      </Text>
                    )}
                    {isLocked && (
                      <Text style={styles.levelLockedText}>
                        Completa el nivel anterior
                      </Text>
                    )}
                  </View>
                  <Text style={styles.levelArrow}>→</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No hay niveles disponibles para este juego
              </Text>
            </View>
          )}
        </View>

        {/* Prize Button - if game is completed */}
        {gameSet.status === 'completed' && gameSet.prizeId && (
          <View style={styles.section}>
            <AppButton
              title="Ver Tu Premio"
              onPress={() => navigation.navigate('Prize', { gameSetId: gameSet._id })}
              icon="🏆"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  levelCard: {
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
  levelCompleted: {
    backgroundColor: '#E8F5E9',
  },
  levelLocked: {
    opacity: 0.5,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  levelIconCompleted: {
    backgroundColor: '#C8E6C9',
  },
  levelIconLocked: {
    backgroundColor: '#E0E0E0',
  },
  levelIconText: {
    fontSize: 24,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  levelType: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  levelCompletedAt: {
    fontSize: 12,
    color: '#4CAF50',
  },
  levelAttempts: {
    fontSize: 12,
    color: '#FF6B9D',
  },
  levelLockedText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  levelArrow: {
    fontSize: 20,
    color: '#FF6B9D',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default GameDetailScreen;
