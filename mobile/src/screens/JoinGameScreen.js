import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameShare } from '../hooks/useGame';
import AppButton from '../components/AppButton';

const JoinGameScreen = ({ navigation }) => {
  const { verifyCode, joinGame, isJoining } = useGameShare();
  const [code, setCode] = useState('');
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await verifyCode(code.toUpperCase());
      setCreatorInfo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Código no válido');
      setCreatorInfo(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleJoinGame = () => {
    joinGame(code.toUpperCase(), {
      onSuccess: () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎮</Text>
          <Text style={styles.title}>Unirse a un Juego</Text>
          <Text style={styles.subtitle}>
            Ingresa el código que te compartieron para jugar
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.form}>
          <Text style={styles.label}>Código de Invitación</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: A1B2C3"
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              setError('');
              setCreatorInfo(null);
            }}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <AppButton
            title="Verificar Código"
            onPress={handleVerifyCode}
            loading={verifying}
            disabled={code.length !== 6}
            style={styles.verifyButton}
          />
        </View>

        {/* Creator Info */}
        {creatorInfo && (
          <View style={styles.creatorCard}>
            <Text style={styles.creatorEmoji}>✅</Text>
            <Text style={styles.creatorTitle}>Código Válido</Text>
            <Text style={styles.creatorInfo}>
              Creado por: {creatorInfo.creator.name}
            </Text>
            <Text style={styles.creatorDescription}>
              Al unirte, podrás jugar con los retos personalizados de {creatorInfo.creator.name}
            </Text>

            <AppButton
              title="Unirse al Juego"
              onPress={handleJoinGame}
              loading={isJoining}
              icon="🚀"
              style={styles.joinButton}
            />
          </View>
        )}

        {/* Help */}
        <View style={styles.helpCard}>
          <Text style={styles.helpEmoji}>💡</Text>
          <Text style={styles.helpTitle}>¿Cómo funciona?</Text>
          <Text style={styles.helpText}>
            Pídele a la persona que creó los retos que te comparta su código único. Ingrésalo aquí para comenzar a jugar.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F8',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
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
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: 8,
  },
  creatorCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  creatorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  creatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  creatorInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  creatorDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  joinButton: {
    minWidth: 200,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  helpEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default JoinGameScreen;