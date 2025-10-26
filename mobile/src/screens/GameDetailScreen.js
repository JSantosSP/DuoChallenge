import React, { useEffect } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useGame } from '../hooks/useGame';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const GameDetailScreen = ({ route, navigation }) => {
  const { gameSet } = route.params;
  
  const { 
    levels, 
    levelsLoading, 
    progress, 
    refetchLevels,
    refetchProgress
  } = useGame(gameSet._id, gameSet.shareCode);

  const [refreshing, setRefreshing] = React.useState(false);

  // Refresh data when screen becomes visible
  useFocusEffect(
    React.useCallback(() => {
      refetchLevels();
      refetchProgress();
      
      // Verificar si el juego está inactivo
      if (gameSet.status === 'abandoned' || gameSet.active === false) {
        Alert.alert(
          'Juego Inactivo',
          'Este juego ya no está activo y no puedes continuar jugando.',
          [
            {
              text: 'Volver a Home',
              onPress: () => navigation.navigate('Home')
            }
          ],
          { cancelable: false }
        );
      }
    }, [gameSet])
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
              const hasNoAttemptsLeft = !level.completed && 
                                       level.currentAttempts >= level.maxAttempts;
              const isDisabled = isLocked || hasNoAttemptsLeft;
              
              return (
                <TouchableOpacity
                  key={level._id}
                  style={[
                    styles.levelCard,
                    level.completed && styles.levelCompleted,
                    isLocked && styles.levelLocked,
                    hasNoAttemptsLeft && styles.levelFailed,
                  ]}
                  onPress={() => {
                    if (hasNoAttemptsLeft) {
                      Alert.alert(
                        'Nivel Bloqueado',
                        'Has agotado todos los intentos en este nivel.',
                        [{ text: 'Entendido' }]
                      );
                      return;
                    }
                    if (!isDisabled) {
                      navigation.navigate('Level', { level, gameSetId: gameSet._id });
                    }
                  }}
                  disabled={isDisabled}
                >
                  <View style={[
                    styles.levelIcon,
                    level.completed && styles.levelIconCompleted,
                    isLocked && styles.levelIconLocked,
                    hasNoAttemptsLeft && styles.levelIconFailed,
                  ]}>
                    <Text style={styles.levelIconText}>
                      {level.completed ? '✅' : 
                       hasNoAttemptsLeft ? '❌' : 
                       isLocked ? '🔒' : '🎯'}
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
                    {hasNoAttemptsLeft && (
                      <Text style={styles.levelFailedText}>
                        ❌ Intentos agotados
                      </Text>
                    )}
                    {!level.completed && !isLocked && !hasNoAttemptsLeft && (
                      <Text style={styles.levelAttempts}>
                        Intentos: {level.currentAttempts || 0} / {level.maxAttempts || 5}
                      </Text>
                    )}
                    {isLocked && !hasNoAttemptsLeft && (
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
              onPress={() => {
                console.log('GameDetailScreen - Navigating to Prize with:', {
                  gameSetId: gameSet._id,
                  shareCode: gameSet.shareCode
                });
                navigation.navigate('Prize', { 
                  gameSetId: gameSet._id,
                  shareCode: gameSet.shareCode
                });
              }}
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
    backgroundColor: colors.neutral.backgroundLight,
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
  levelFailed: {
    backgroundColor: '#FFEBEE',
    opacity: 0.7,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest.light,
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
  levelIconFailed: {
    backgroundColor: '#FFCDD2',
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
  levelFailedText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  levelAttempts: {
    fontSize: 12,
    color: colors.forest.medium,
  },
  levelLockedText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  levelArrow: {
    fontSize: 20,
    color: colors.forest.medium,
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
