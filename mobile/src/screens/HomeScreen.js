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
import { useAuth } from '../context/AuthContext';
import { useGame } from '../hooks/useGame';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    levels, 
    levelsLoading, 
    progress, 
    refetchLevels,
    refetchProgress,
    generateGame
  } = useGame();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLevels(), refetchProgress()]);
    setRefreshing(false);
  };

  // Encontrar el siguiente nivel pendiente
  const nextLevel = levels?.find(level => !level.completed);
  const hasActiveGame = progress?.hasActiveGame;

  const handleContinue = () => {
    if (nextLevel) {
      navigation.navigate('Level', { level: nextLevel });
    }
  };

  const handleGenerateGame = () => {
    generateGame();
  };

  if (levelsLoading) {
    return <LoadingOverlay message="Cargando tu juego..." />;
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
          <Text style={styles.greeting}>¡Hola, {user?.name}! 💕</Text>
          <Text style={styles.subtitle}>
            {hasActiveGame 
              ? 'Continúa con tu aventura' 
              : 'Genera tu primer juego'}
          </Text>
        </View>

        {hasActiveGame ? (
          <>
            {/* Progress */}
            <View style={styles.section}>
              <ProgressBar
                progress={progress?.completedChallenges || 0}
                total={progress?.totalChallenges || 0}
              />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{progress?.completedLevels || 0}</Text>
                <Text style={styles.statLabel}>Niveles Completados</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{progress?.totalSetsCompleted || 0}</Text>
                <Text style={styles.statLabel}>Sets Completados</Text>
              </View>
            </View>

            {/* Levels List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tus Niveles</Text>
              {levels?.map((level) => (
                <TouchableOpacity
                  key={level._id}
                  style={[
                    styles.levelCard,
                    level.completed && styles.levelCompleted,
                  ]}
                  onPress={() => navigation.navigate('Level', { level })}
                >
                  <View style={styles.levelIcon}>
                    <Text style={styles.levelIconText}>
                      {level.completed ? '✅' : '🔒'}
                    </Text>
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelTitle}>{level.title}</Text>
                    <Text style={styles.levelDescription}>
                      {level.challenges?.length} retos
                    </Text>
                  </View>
                  <Text style={styles.levelArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Continue Button */}
            {nextLevel && (
              <View style={styles.section}>
                <AppButton
                  title="Continuar Jugando"
                  onPress={handleContinue}
                  icon="🎮"
                />
              </View>
            )}

            {/* Prize Button */}
            {progress?.currentPrize && (
              <View style={styles.section}>
                <AppButton
                  title="Ver Tu Premio"
                  onPress={() => navigation.navigate('Prize')}
                  variant="secondary"
                  icon="🏆"
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyTitle}>¡Comienza tu Aventura!</Text>
            <Text style={styles.emptyText}>
              Genera tu primer juego y descubre los retos que he preparado para ti
            </Text>
            <AppButton
              title="Generar Juego"
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
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666666',
  },
  levelArrow: {
    fontSize: 20,
    color: '#FF6B9D',
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
    marginBottom: 32,
  },
  generateButton: {
    minWidth: 200,
  },
});

export default HomeScreen;