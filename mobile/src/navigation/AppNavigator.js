import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import LevelScreen from '../screens/LevelScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import PrizeScreen from '../screens/PrizeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Main Stack
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#333333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Escape Room',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.settingsButton}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Level"
        component={LevelScreen}
        options={({ route }) => ({
          title: route.params?.level?.title || 'Nivel',
          headerBackTitle: 'Atrás',
        })}
      />
      <Stack.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          title: 'Reto',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="Prize"
        component={PrizeScreen}
        options={{
          title: 'Tu Premio',
          headerBackTitle: 'Atrás',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          headerBackTitle: 'Atrás',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

// Main Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
});

export default AppNavigator;