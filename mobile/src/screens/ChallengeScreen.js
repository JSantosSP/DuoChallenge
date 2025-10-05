import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import AppButton from '../components/AppButton';

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

const ChallengeScreen = ({ route, navigation }) => {
  const { challenge } = route.params;
  const { verifyChallenge, verifyLoading } = useGame();
  
  const [answer, setAnswer] = useState('');
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Por favor ingresa una respuesta');
      return;
    }

    verifyChallenge(
      { challengeId: challenge._id, answer: answer.trim() },
      {
        onSuccess: (data) => {
          if (data.data.correct) {
            navigation.goBack();
          } else {
            setAttempts(attempts + 1);
            setAnswer('');
            
            // Mostrar siguiente pista si hay intentos fallidos
            if (data.data.hint && currentHintIndex < challenge.hints?.length - 1) {
              setCurrentHintIndex(currentHintIndex + 1);
            }
            
            Alert.alert(
              'Intenta de nuevo 💭',
              data.data.message + 
              (data.data.attemptsLeft ? `\n\nIntentos restantes: ${data.data.attemptsLeft}` : '')
            );
          }
        },
      }
    );
  };

  const showNextHint = () => {
    if (currentHintIndex < challenge.hints?.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const renderInputByType = () => {
    switch (challenge.type) {
      case 'date_guess':
        return (
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (ej: 2020-06-15)"
            value={answer}
            onChangeText={setAnswer}
            keyboardType="default"
          />
        );
      
      case 'location':
      case 'riddle':
      case 'question':
      default:
        return (
          <TextInput
            style={styles.input}
            placeholder="Tu respuesta..."
            value={answer}
            onChangeText={setAnswer}
            autoCapitalize="sentences"
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.typeLabel}>
            {getChallengeTypeLabel(challenge.type)}
          </Text>
        </View>

        {/* Image if exists */}
        {challenge.imagePath && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `http://localhost:4000${challenge.imagePath}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{challenge.question}</Text>
        </View>

        {/* Hints */}
        {challenge.hints && challenge.hints.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>💡 Pistas</Text>
            {challenge.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
              <View key={index} style={styles.hintCard}>
                <Text style={styles.hintNumber}>Pista {index + 1}</Text>
                <Text style={styles.hintText}>{hint}</Text>
              </View>
            ))}
            
            {currentHintIndex < challenge.hints.length - 1 && (
              <AppButton
                title="Ver siguiente pista"
                onPress={showNextHint}
                variant="outline"
                style={styles.hintButton}
              />
            )}
          </View>
        )}

        {/* Answer Input */}
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Tu respuesta:</Text>
          {renderInputByType()}
          
          <AppButton
            title="Verificar Respuesta"
            onPress={handleSubmit}
            loading={verifyLoading}
            icon="✨"
            style={styles.submitButton}
          />
          
          {attempts > 0 && (
            <Text style={styles.attemptsText}>
              Intentos realizados: {attempts} / {challenge.maxAttempts}
            </Text>
          )}
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
  typeLabel: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  imageContainer: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 250,
  },
  questionContainer: {
    padding: 24,
    paddingTop: 16,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 32,
  },
  hintsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  hintsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  hintCard: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  hintNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  hintButton: {
    marginTop: 8,
  },
  answerContainer: {
    padding: 24,
    paddingTop: 0,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  attemptsText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
});

export default ChallengeScreen;