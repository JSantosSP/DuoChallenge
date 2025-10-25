import React,  { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useGame } from '../hooks/useGame';
import colors from '../utils/colors';

const getChallengeTypeLabel = (type) => {
  const labels = {
    texto: '✏️ Reto de Texto',
    fecha: '📅 Adivina la Fecha',
    foto: '🖼️ Reto Visual',
    lugar: '📍 Adivina el Lugar',
  };
  return labels[type] || '🎯 Reto';
};

const LevelScreen = ({ route, navigation }) => {
  const { refetchLevels, levels } = useGame();
  const [refreshing, setRefreshing] = React.useState(false);

  // Encontrar el nivel actualizado
  const levelId = route.params?.level?._id;
  const currentLevel = levels?.find(l => l._id === levelId) || route.params?.level;

  // Refresh data when screen becomes visible
  useFocusEffect(
    React.useCallback(() => {
      refetchLevels();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLevels();
    setRefreshing(false);
  };

  const handleChallengePress = (challenge) => {
    if (challenge.completed) {
      return;
    }
    navigation.navigate('Challenge', { 
      challenge, 
      levelId: currentLevel._id, 
      gameSetId: route.params?.gameSetId
    });
  };

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
          <Text style={styles.title}>Nivel {currentLevel.order || 1}</Text>
          <Text style={styles.subtitle}>{currentLevel.pregunta}</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {currentLevel.completed ? '✅ Completado' : '⏳ En progreso'}
            </Text>
            <Text style={styles.progressText}>
              Intentos: {currentLevel.currentAttempts || 0} / {currentLevel.maxAttempts || 5}
            </Text>
          </View>
        </View>

        {/* Level Info */}
        <View style={styles.challengesContainer}>
          <View style={styles.levelInfoCard}>
            <Text style={styles.levelInfoTitle}>Información del Nivel</Text>
            <Text style={styles.levelInfoText}>
              Tipo: {getChallengeTypeLabel(currentLevel.tipoDato?.type)}
            </Text>
            <Text style={styles.levelInfoText}>
              Dificultad: {currentLevel.difficulty || 'medium'}
            </Text>
            {currentLevel.pistas && currentLevel.pistas.length > 0 && (
              <Text style={styles.levelInfoText}>
                Pistas disponibles: {currentLevel.pistas.length}
              </Text>
            )}
          </View>

          {/* Play Button */}
          <TouchableOpacity
            style={[
              styles.playButton,
              currentLevel.completed && styles.playButtonCompleted
            ]}
            onPress={() => handleChallengePress(currentLevel)}
            disabled={currentLevel.completed}
          >
            <Text style={styles.playButtonText}>
              {currentLevel.completed ? '✅ Completado' : '🎮 Jugar Nivel'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos sin cambios...
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
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  progressIndicator: {
    backgroundColor: colors.forest.light,
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest.medium,
  },
  challengesContainer: {
    padding: 24,
  },
  challengeCard: {
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
  challengeCompleted: {
    backgroundColor: '#E8F5E9',
    opacity: 0.7,
  },
  challengeNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest.medium,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeType: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  challengeQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  challengeArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: colors.forest.medium,
  },
  levelInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  levelInfoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  playButton: {
    backgroundColor: colors.forest.medium,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  playButtonCompleted: {
    backgroundColor: '#4CAF50',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default LevelScreen;
