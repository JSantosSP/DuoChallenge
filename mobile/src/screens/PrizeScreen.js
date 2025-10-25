import React,  { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import { getImageUrl } from '../api/api';
import AppButton from '../components/AppButton';
import { colors } from '../utils/colors';
import LoadingOverlay from '../components/LoadingOverlay';

const PrizeScreen = ({ route, navigation }) => {
  const { gameSetId, shareCode } = route.params || {};
  const { prize, getPrize, restartGame } = useGame();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    getPrize();
  }, []);

  useEffect(() => {
    if (prize) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [prize]);

  const handleNewGame = async () => {
    if (!shareCode) {
      Alert.alert(
        'No se puede reiniciar',
        'Este juego no tiene un código de compartición válido. Solo puedes reiniciar juegos compartidos por otra persona.',
        [{ text: 'Entendido', onPress: () => navigation.navigate('Home') }]
      );
      return;
    }

    try {
      await restartGame({ shareCode });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      // El error ya se maneja en el hook
      console.error('Error restarting game:', error);
    }
  };

  if (!prize) {
    return <LoadingOverlay message="Cargando tu premio..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Animated.View
          style={[
            styles.prizeContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Celebration Header */}
          <View style={styles.celebrationHeader}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>¡Felicidades!</Text>
            <Text style={styles.celebrationSubtitle}>
              Has completado todos los retos
            </Text>
          </View>

          {/* Prize Card */}
          <View style={styles.prizeCard}>
            <View style={styles.prizeIconContainer}>
              <Text style={styles.prizeIcon}>🏆</Text>
            </View>

            {prize.imagePath && (
              <Image
                source={{ uri: getImageUrl(prize.imagePath) }}
                style={styles.prizeImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.prizeTitle}>{prize.title}</Text>
            <Text style={styles.prizeDescription}>{prize.description}</Text>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              ❤️ Este premio es especial para ti. ¡Disfrútalo! ❤️
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <AppButton
              title="Iniciar Nuevo Juego"
              onPress={handleNewGame}
              icon="🎮"
            />
            
            <AppButton
              title="Volver al Inicio"
              onPress={() => navigation.navigate('Home')}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>
        </Animated.View>
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  prizeContainer: {
    alignItems: 'center',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  prizeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  prizeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.forest.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  prizeIcon: {
    fontSize: 40,
  },
  prizeImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  prizeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  prizeDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  messageContainer: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  messageText: {
    fontSize: 16,
    color: colors.forest.medium,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionsContainer: {
    width: '100%',
  },
  secondaryButton: {
    marginTop: 12,
  },
});

export default PrizeScreen;
