import React,  { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShare } from '../hooks/useShare';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const JoinGameScreen = ({ navigation }) => {
  const { joinGame, verifyShareCode, loading } = useShare();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Ingresa un código');
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyShareCode(code.trim().toUpperCase());
      
      if (result.success) {
        setGameInfo(result.data);
      } else {
        Alert.alert('Código inválido', result.message);
        setGameInfo(null);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el código');
      setGameInfo(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameInfo) return;

    try {
      const result = await joinGame(code.trim().toUpperCase());
      
      if (result.success) {
        Alert.alert(
          '¡Te has unido al juego!',
          `Ahora puedes jugar con los datos de ${gameInfo.creator.name}`,
          [
            {
              text: 'Comenzar a jugar',
              onPress: () => {
                // Navegar al juego
                navigation.navigate('Home');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo unir al juego');
    }
  };

  const formatCode = (text) => {
    // Formatear código en mayúsculas y limitar a 6 caracteres
    const formatted = text.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    setCode(formatted);
  };

  if (loading) {
    return <LoadingOverlay message="Uniéndose al juego..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Unirse a un Juego</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de invitación para jugar
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Código de invitación</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="ABC123"
            value={code}
            onChangeText={formatCode}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            textAlign="center"
            fontSize={24}
            fontFamily="monospace"
          />
          <Text style={styles.codeHint}>
            Ingresa el código de 6 caracteres que te compartieron
          </Text>
        </View>

        {/* Verify Button */}
        <View style={styles.section}>
          <AppButton
            title={verifying ? "Verificando..." : "Verificar Código"}
            onPress={handleVerifyCode}
            icon="🔍"
            disabled={!code || code.length !== 6 || verifying}
          />
        </View>

        {/* Game Info */}
        {gameInfo && (
          <View style={styles.gameInfoCard}>
            <Text style={styles.gameInfoTitle}>Información del Juego</Text>
            
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorLabel}>Creado por:</Text>
              <Text style={styles.creatorName}>{gameInfo.creator.name}</Text>
            </View>

            <View style={styles.codeInfo}>
              <Text style={styles.codeLabel}>Código:</Text>
              <Text style={styles.codeDisplay}>{code}</Text>
            </View>

            <Text style={styles.gameDescription}>
              Te unirás a un juego personalizado con datos creados por {gameInfo.creator.name}.
              ¡Prepárate para los desafíos!
            </Text>

            <AppButton
              title="Unirse al Juego"
              onPress={handleJoinGame}
              icon="🎮"
              style={styles.joinButton}
            />
          </View>
        )}

        {/* Help */}
        <View style={styles.section}>
          <Text style={styles.helpTitle}>¿Cómo obtener un código?</Text>
          <Text style={styles.helpText}>
            • Pide a un amigo que genere un código desde su app{'\n'}
            • El código debe tener exactamente 6 caracteres{'\n'}
            • Los códigos pueden expirar o ser desactivados
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.backgroundLight,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    fontSize: 24,
    fontFamily: 'monospace',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  gameInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  creatorInfo: {
    marginBottom: 12,
  },
  creatorLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.forest.medium,
  },
  codeInfo: {
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  codeDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  joinButton: {
    marginTop: 0,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default JoinGameScreen;
