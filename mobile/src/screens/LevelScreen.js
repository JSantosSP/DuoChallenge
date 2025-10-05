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
import { useIsFocused } from '@react-navigation/native';
import { useGame } from '../hooks/useGame';

const getChallengeTypeLabel = (type) => {
  const labels = {
    date_guess: '📅 Adivina la Fecha',
    riddle: '🤔 Acertijo',
    photo_puzzle: '🖼️ Puzzle Visual',
    location: '📍 Adivina el Lugar',
    question: '❓ Pregunta',
  };
  return labels[type] || '🎯 Reto';
};

const LevelScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { refetchLevels, levels } = useGame();
  const [refreshing, setRefreshing] = React.useState(false);

  // Encontrar el nivel actualizado
  const levelId = route.params?.level?._id;
  const currentLevel = levels?.find(l => l._id === levelId) || route.params?.level;

  // Refrescar cuando la pantalla vuelve a estar en foco
  useEffect(() => {
    if (isFocused) {
      refetchLevels();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchLevels();
    setRefreshing(false);
  };

  const handleChallengePress = (challenge) => {
    if (challenge.completed) {
      return;
    }
    navigation.navigate('Challenge', { challenge, levelId: currentLevel._id });
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
          <Text style={styles.title}>{currentLevel.title}</Text>
          <Text style={styles.subtitle}>{currentLevel.description}</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {currentLevel.challenges?.filter(c => c.completed).length} /{' '}
              {currentLevel.challenges?.length} retos completados
            </Text>
          </View>
        </View>

        {/* Challenges */}
        <View style={styles.challengesContainer}>
          {currentLevel.challenges?.map((challenge, index) => (
            <TouchableOpacity
              key={challenge._id}
              style={[
                styles.challengeCard,
                challenge.completed && styles.challengeCompleted,
              ]}
              onPress={() => handleChallengePress(challenge)}
              disabled={challenge.completed}
            >
              <View style={styles.challengeNumber}>
                <Text style={styles.challengeNumberText}>
                  {challenge.completed ? '✅' : index + 1}
                </Text>
              </View>
              
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeType}>
                  {getChallengeTypeLabel(challenge.type)}
                </Text>
                <Text style={styles.challengeQuestion} numberOfLines={2}>
                  {challenge.question}
                </Text>
                {challenge.completed && (
                  <Text style={styles.completedText}>¡Completado!</Text>
                )}
              </View>

              <View style={styles.challengeArrow}>
                <Text style={styles.arrowText}>
                  {challenge.completed ? '✓' : '→'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos sin cambios...
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
    backgroundColor: '#FFF0F5',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
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
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
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
    color: '#FF6B9D',
  },
});

export default LevelScreen;