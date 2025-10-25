import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import { getImageUrl } from '../api/api';
import AppButton from '../components/AppButton';
import ChallengeInput from '../components/ChallengeInput';
import { colors } from '../utils/colors';

const getChallengeTypeLabel = (type) => {
  const labels = {
    texto: '✏️ Reto de Texto',
    fecha: '📅 Adivina la Fecha',
    foto: '🖼️ Reto Visual',
    lugar: '📍 Adivina el Lugar',
  };
  return labels[type] || '🎯 Reto';
};

const ChallengeScreen = ({ route, navigation }) => {
  const { challenge } = route.params;
  const { verifyLevel, verifyLoading } = useGame();
  
  const [answer, setAnswer] = useState('');
  const [puzzleOrder, setPuzzleOrder] = useState(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async () => {
    const challengeType = challenge.tipoDato?.type;
    
    // Validar según el tipo de reto
    if (challengeType === 'foto') {
      if (!puzzleOrder) {
        Alert.alert('Error', 'Por favor completa el puzzle');
        return;
      }
    } else {
      if (!answer.trim()) {
        Alert.alert('Error', 'Por favor ingresa una respuesta');
        return;
      }
    }

    // Preparar payload según tipo de reto
    const payload = challengeType === 'foto' 
      ? { puzzleOrder }
      : { answer: answer.trim().toLowerCase() }; // Normalizar respuesta

    verifyLevel(
      { levelId: challenge._id, payload },
      {
        onSuccess: (data) => {
          if (data.data.correct) {
            navigation.goBack();
          } else {
            setAttempts(attempts + 1);
            if (challengeType !== 'foto') {
              setAnswer('');
            }
            
            // Mostrar siguiente pista si hay intentos fallidos
            if (data.data.hint && currentHintIndex < challenge.pistas?.length - 1) {
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

  const handlePuzzleComplete = (order) => {
    // Guardar el orden del puzzle y enviar automáticamente
    setPuzzleOrder(order);
    
    // Enviar verificación automáticamente
    setTimeout(() => {
      const payload = { puzzleOrder: order };
      verifyLevel(
        { levelId: challenge._id, payload },
        {
          onSuccess: (data) => {
            if (data.data.correct) {
              navigation.goBack();
            } else {
              setAttempts(attempts + 1);
              Alert.alert(
                'Intenta de nuevo 💭',
                data.data.message + 
                (data.data.attemptsLeft ? `\n\nIntentos restantes: ${data.data.attemptsLeft}` : '')
              );
            }
          },
        }
      );
    }, 500); // Pequeño delay para que se vea la animación
  };

  const showNextHint = () => {
    if (currentHintIndex < challenge.pistas?.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.typeLabel}>
            {getChallengeTypeLabel(challenge.tipoDato?.type)}
          </Text>
        </View>

        {/* Image if exists (only for non-puzzle challenges) */}
        {challenge.imagePath && challenge.tipoDato?.type !== 'foto' && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(challenge.imagePath) }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{challenge.pregunta}</Text>
        </View>

        {/* Hints */}
        {challenge.pistas && challenge.pistas.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>💡 Pistas</Text>
            {challenge.pistas.slice(0, currentHintIndex + 1).map((hint, index) => (
              <View key={index} style={styles.hintCard}>
                <Text style={styles.hintNumber}>Pista {index + 1}</Text>
                <Text style={styles.hintText}>{hint}</Text>
              </View>
            ))}
            
            {currentHintIndex < challenge.pistas.length - 1 && (
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
          {challenge.tipoDato?.type !== 'foto' && (
            <Text style={styles.answerLabel}>
              {challenge.tipoDato?.type === 'lugar' ? 'Lugar:' : 
               challenge.tipoDato?.type === 'fecha' ? 'Fecha:' : 
               'Tu respuesta:'}
            </Text>
          )}
          {console.log('Rendering ChallengeInput with type:', challenge.tipoDato
          )}
          <ChallengeInput
            type={challenge.tipoDato?.type}
            value={answer}
            onChangeText={setAnswer}
            challenge={challenge}
            onPuzzleComplete={handlePuzzleComplete}
            style={styles.input}
          />
          
          {challenge.tipoDato?.type !== 'foto' && (
            <AppButton
              title="Verificar Respuesta"
              onPress={handleSubmit}
              loading={verifyLoading}
              icon="✨"
              style={styles.submitButton}
            />
          )}
          
          {attempts > 0 && (
            <Text style={styles.attemptsText}>
              Intentos realizados: {attempts} / {challenge.maxAttempts || 5}
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
  },
  typeLabel: {
    fontSize: 16,
    color: colors.forest.medium,
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
    backgroundColor: colors.ocean.light,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.ocean.medium,
  },
  hintNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forest.medium,
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
