# 💻 Ejemplos de Código - DuoChallenge

> Ejemplos prácticos de implementación para los 3 roles

---

## 📱 MOBILE APP - Ejemplos React Native

### 1. Contexto de Autenticación

```javascript
// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@token');
      const storedUser = await AsyncStorage.getItem('@user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data.data;

      setUser(user);
      setToken(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      await AsyncStorage.setItem('@token', token);
      await AsyncStorage.setItem('@refreshToken', refreshToken);
      await AsyncStorage.setItem('@user', JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (name, email, password, role = 'player') => {
    try {
      const response = await api.post('/auth/register', { 
        name, email, password, role 
      });
      const { user, token, refreshToken } = response.data.data;

      setUser(user);
      setToken(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      await AsyncStorage.setItem('@token', token);
      await AsyncStorage.setItem('@refreshToken', refreshToken);
      await AsyncStorage.setItem('@user', JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrar' 
      };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    api.defaults.headers.Authorization = null;

    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@refreshToken');
    await AsyncStorage.removeItem('@user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Hook de Juego

```javascript
// src/hooks/useGame.js
import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const useGame = () => {
  const [gameInstance, setGameInstance] = useState(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGameState = useCallback(async () => {
    try {
      setLoading(true);
      const [instanceRes, levelsRes, progressRes] = await Promise.all([
        api.get('/api/share/my-instances'),
        api.get('/api/levels'),
        api.get('/api/progress')
      ]);

      const instance = instanceRes.data.data.instances[0];
      const levelsData = levelsRes.data.data.levels;
      const progressData = progressRes.data.data;

      setGameInstance(instance);
      setLevels(levelsData);
      setProgress(progressData.progress);

      // Encontrar nivel actual (primer incompleto)
      const current = levelsData.find(l => !l.completed);
      setCurrentLevel(current);

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando juego');
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGame = async (code) => {
    try {
      setLoading(true);
      const response = await api.post('/api/share/join', { code });
      await fetchGameState();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Error al unirse' 
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyChallenge = async (challengeId, answer) => {
    try {
      const response = await api.post(
        `/api/challenge/${challengeId}/verify`, 
        { answer }
      );
      
      // Refrescar estado del juego
      await fetchGameState();
      
      return response.data;
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Error verificando respuesta' 
      };
    }
  };

  const getPrize = async () => {
    try {
      const response = await api.get('/api/prize');
      return response.data.data.prize;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error obteniendo premio');
    }
  };

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  return {
    gameInstance,
    levels,
    currentLevel,
    progress,
    loading,
    error,
    joinGame,
    verifyChallenge,
    getPrize,
    refresh: fetchGameState
  };
};
```

### 3. Screen de Desafío

```javascript
// src/screens/ChallengeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, StyleSheet, Alert } from 'react-native';
import api from '../api/api';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const ChallengeScreen = ({ route, navigation }) => {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(null);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/challenge/${challengeId}`);
      setChallenge(response.data.data.challenge);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el desafío');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Por favor ingresa una respuesta');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/api/challenge/${challengeId}/verify`,
        { answer }
      );

      if (response.data.correct) {
        if (response.data.gameCompleted) {
          // Juego completado!
          Alert.alert(
            '¡Felicidades!',
            '¡Has completado todos los niveles!',
            [{ 
              text: 'Ver Premio', 
              onPress: () => navigation.navigate('Prize', { 
                prize: response.data.prize 
              }) 
            }]
          );
        } else if (response.data.levelCompleted) {
          // Nivel completado
          Alert.alert(
            '¡Nivel Completado!',
            response.data.message,
            [{ 
              text: 'Continuar', 
              onPress: () => navigation.goBack() 
            }]
          );
        } else {
          // Challenge completado
          Alert.alert(
            '¡Correcto!',
            response.data.message,
            [{ 
              text: 'Siguiente', 
              onPress: () => navigation.goBack() 
            }]
          );
        }
      } else {
        // Respuesta incorrecta
        setHint(response.data.hint);
        Alert.alert(
          'Incorrecto',
          `${response.data.message}${response.data.hint ? '\n\nPista: ' + response.data.hint : ''}`,
          [{ text: 'Intentar de nuevo' }]
        );
        setAnswer('');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error verificando respuesta');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !challenge) {
    return <LoadingOverlay />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.type}>
        {challenge?.type === 'date_guess' ? '📅 Fecha' : '❓ Pregunta'}
      </Text>

      {challenge?.imagePath && (
        <Image 
          source={{ uri: `${api.defaults.baseURL}${challenge.imagePath}` }}
          style={styles.image}
        />
      )}

      <Text style={styles.question}>{challenge?.question}</Text>

      {hint && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintLabel}>💡 Pista:</Text>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Tu respuesta..."
        value={answer}
        onChangeText={setAnswer}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.attempts}>
        Intentos restantes: {challenge?.maxAttempts - challenge?.currentAttempts}
      </Text>

      <AppButton 
        title="Verificar" 
        onPress={handleSubmit}
        loading={loading}
      />

      {loading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  type: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  hintContainer: {
    backgroundColor: '#FFF9E6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  hintLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  attempts: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});

export default ChallengeScreen;
```

### 4. Screen de Creador - Subir Datos

```javascript
// src/screens/EditDataScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import AppButton from '../components/AppButton';

const EditDataScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    tipoDato: 'fecha',
    valor: '',
    pregunta: '',
    pistas: ['', '', ''],
    categorias: []
  });
  const [loading, setLoading] = useState(false);

  const tipos = [
    { label: 'Fecha', value: 'fecha' },
    { label: 'Lugar', value: 'lugar' },
    { label: 'Nombre', value: 'nombre' },
    { label: 'Foto', value: 'foto' },
    { label: 'Texto', value: 'texto' }
  ];

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Subir imagen
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: `foto_${Date.now()}.jpg`
      });

      const response = await api.post('/api/userdata/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({ 
        ...prev, 
        imagePath: response.data.data.imagePath 
      }));
      Alert.alert('Éxito', 'Imagen subida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.valor || !formData.pregunta) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/userdata', {
        ...formData,
        pistas: formData.pistas.filter(p => p.trim() !== '')
      });

      Alert.alert('Éxito', 'Dato personal guardado', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error guardando dato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tipo de Dato</Text>
      <View style={styles.typeButtons}>
        {tipos.map(tipo => (
          <AppButton
            key={tipo.value}
            title={tipo.label}
            onPress={() => setFormData(prev => ({ ...prev, tipoDato: tipo.value }))}
            variant={formData.tipoDato === tipo.value ? 'primary' : 'secondary'}
          />
        ))}
      </View>

      {formData.tipoDato === 'foto' && (
        <AppButton
          title="Seleccionar Imagen"
          onPress={handleImagePick}
          icon="image"
        />
      )}

      <Text style={styles.label}>Valor *</Text>
      <TextInput
        style={styles.input}
        placeholder={
          formData.tipoDato === 'fecha' ? '2020-05-15' :
          formData.tipoDato === 'lugar' ? 'Parque Central' :
          'Tu respuesta correcta'
        }
        value={formData.valor}
        onChangeText={(text) => setFormData(prev => ({ ...prev, valor: text }))}
      />

      <Text style={styles.label}>Pregunta *</Text>
      <TextInput
        style={styles.input}
        placeholder="¿Cuándo fue nuestra primera cita?"
        value={formData.pregunta}
        onChangeText={(text) => setFormData(prev => ({ ...prev, pregunta: text }))}
        multiline
      />

      <Text style={styles.label}>Pistas</Text>
      {formData.pistas.map((pista, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={`Pista ${index + 1}`}
          value={pista}
          onChangeText={(text) => {
            const newPistas = [...formData.pistas];
            newPistas[index] = text;
            setFormData(prev => ({ ...prev, pistas: newPistas }));
          }}
        />
      ))}

      <AppButton
        title="Guardar Dato"
        onPress={handleSubmit}
        loading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
});

export default EditDataScreen;
```

---

## 🖥️ BACKOFFICE - Ejemplos React

### 1. Página de Categorías (Admin)

```jsx
// src/pages/Categories.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  // Fetch categorías
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data.data.categories;
    }
  });

  // Crear categoría
  const createMutation = useMutation({
    mutationFn: async (categoryData) => {
      const { data } = await api.post('/admin/categories', categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      alert('Categoría creada exitosamente');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Error al crear categoría');
    }
  });

  // Actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingCategory(null);
      alert('Categoría actualizada exitosamente');
    }
  });

  // Eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      alert('Categoría eliminada');
    }
  });

  const handleSubmit = (formData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category) => {
    if (window.confirm(`¿Eliminar categoría "${category.name}"?`)) {
      deleteMutation.mutate(category._id);
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { 
      key: 'active', 
      label: 'Estado',
      render: (value) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Activa' : 'Inactiva'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleEdit(row)}
          >
            Editar
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row)}
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return <div className="spinner">Cargando...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Categorías</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          Nueva Categoría
        </button>
      </div>

      <DataTable 
        columns={columns}
        data={categories}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

// Formulario de categoría
const CategoryForm = ({ category, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    active: category?.active ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nombre *</label>
        <input
          type="text"
          className="form-control"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          className="form-control"
          rows="3"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          />
          {' '}Activa
        </label>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};

export default Categories;
```

---

## 🔧 BACKEND - Ejemplos Node.js

### 1. Servicio de Generación de Juego

```javascript
// backend/src/services/gameset.service.js
const { GameSet, User, Level, GameInstance } = require('../models');
const { generateGameSeed } = require('../utils/seed.util');
const { generateLevels } = require('./level.service');
const { assignPrize } = require('./prize.service');

/**
 * Genera un nuevo set de juego completo
 * @param {ObjectId} creatorId - ID del creador (de quien se usan los datos)
 * @param {ObjectId} gameInstanceId - ID de la instancia (opcional)
 * @returns {GameSet} Nuevo set de juego generado
 */
const generateNewGameSet = async (creatorId, gameInstanceId = null) => {
  try {
    // 1. Generar seed único para reproducibilidad
    const seed = generateGameSeed();
    console.log(`🎲 Seed generado: ${seed}`);

    // 2. Determinar el usuario objetivo
    let targetUserId = creatorId;
    if (gameInstanceId) {
      const instance = await GameInstance.findById(gameInstanceId);
      if (instance) {
        targetUserId = instance.playerId; // El jugador es quien juega
      }
    }

    // 3. Desactivar set anterior
    const updateQuery = gameInstanceId
      ? { gameInstanceId, active: true }
      : { userId: targetUserId, active: true, gameInstanceId: null };
    
    await GameSet.updateMany(updateQuery, { active: false });
    console.log('♻️ Sets anteriores desactivados');

    // 4. Crear nuevo GameSet
    const gameSet = new GameSet({
      userId: targetUserId,
      gameInstanceId: gameInstanceId || null,
      levels: [],
      seed,
      prizeId: null,
      completed: false,
      active: true
    });

    await gameSet.save();
    console.log(`✅ GameSet creado: ${gameSet._id}`);

    // 5. Generar niveles usando datos del CREADOR
    const levels = await generateLevels(
      creatorId,      // Datos de quién
      gameSet._id,    // Para qué set
      seed,           // Con qué seed
      3               // Cuántos niveles
    );

    console.log(`🎯 ${levels.length} niveles generados`);

    // 6. Actualizar set con los niveles
    gameSet.levels = levels.map(l => l._id);
    await gameSet.save();

    // 7. Actualizar usuario o instancia
    if (gameInstanceId) {
      await GameInstance.findByIdAndUpdate(gameInstanceId, {
        currentSetId: gameSet._id,
        completedChallenges: [],
        completedLevels: [],
        currentPrizeId: null
      });
    } else {
      await User.findByIdAndUpdate(targetUserId, {
        currentSetId: gameSet._id,
        completedChallenges: [],
        completedLevels: [],
        currentPrizeId: null
      });
    }

    console.log('🎮 GameSet listo para jugar');
    return gameSet;

  } catch (error) {
    console.error('❌ Error generando GameSet:', error);
    throw error;
  }
};

/**
 * Verifica si el set está completado y asigna premio
 * @param {ObjectId} userId - ID del usuario
 * @returns {Object} Estado de completitud y premio si aplica
 */
const checkGameSetCompletion = async (userId, gameInstanceId = null) => {
  try {
    let currentSetId;

    if (gameInstanceId) {
      const instance = await GameInstance.findById(gameInstanceId);
      currentSetId = instance?.currentSetId;
    } else {
      const user = await User.findById(userId);
      currentSetId = user?.currentSetId;
    }

    if (!currentSetId) {
      return { completed: false };
    }

    const gameSet = await GameSet.findById(currentSetId).populate('levels');
    
    if (!gameSet) {
      return { completed: false };
    }

    // Verificar si todos los niveles están completados
    const allLevelsCompleted = gameSet.levels.every(level => level.completed);

    if (allLevelsCompleted && !gameSet.completed) {
      console.log('🎉 ¡Todos los niveles completados!');

      // Marcar set como completado
      gameSet.completed = true;
      gameSet.completedAt = new Date();
      
      // Asignar premio aleatorio
      const prize = await assignPrize(userId, gameSet.seed);
      gameSet.prizeId = prize._id;
      
      await gameSet.save();

      // Incrementar contador de sets completados
      if (gameInstanceId) {
        await GameInstance.findByIdAndUpdate(gameInstanceId, {
          $inc: { completedSets: 1 },
          currentPrizeId: prize._id
        });
      } else {
        await User.findByIdAndUpdate(userId, {
          $inc: { totalSetsCompleted: 1 }
        });
      }

      return {
        completed: true,
        prize,
        message: '¡Felicidades! Has completado todos los niveles'
      };
    }

    return { completed: false };
    
  } catch (error) {
    console.error('Error verificando completitud:', error);
    throw error;
  }
};

module.exports = {
  generateNewGameSet,
  checkGameSetCompletion
};
```

### 2. Servicio de Generación de Niveles

```javascript
// backend/src/services/level.service.js
const { Level, UserData, LevelTemplate } = require('../models');
const { generateChallenges } = require('./challenge.service');
const { shuffleWithSeed } = require('../utils/seed.util');

/**
 * Genera niveles para un GameSet
 * @param {ObjectId} creatorId - De quién son los datos
 * @param {ObjectId} gameSetId - Para qué set
 * @param {String} seed - Seed para reproducibilidad
 * @param {Number} numLevels - Cuántos niveles generar
 */
const generateLevels = async (creatorId, gameSetId, seed, numLevels = 3) => {
  try {
    console.log(`🔨 Generando ${numLevels} niveles...`);

    // 1. Obtener datos del creador
    const userdata = await UserData.find({
      userId: creatorId,
      active: true
    });

    if (userdata.length === 0) {
      throw new Error('El creador no tiene datos personalizados');
    }

    console.log(`📊 ${userdata.length} datos disponibles`);

    // 2. Agrupar por tipo de dato
    const groupedData = {};
    userdata.forEach(data => {
      if (!groupedData[data.tipoDato]) {
        groupedData[data.tipoDato] = [];
      }
      groupedData[data.tipoDato].push(data);
    });

    // 3. Obtener plantillas de nivel activas
    const levelTemplates = await LevelTemplate.find({ active: true })
      .populate('categoryId');

    if (levelTemplates.length === 0) {
      throw new Error('No hay plantillas de nivel disponibles');
    }

    // 4. Mezclar plantillas con seed
    const shuffledTemplates = shuffleWithSeed(levelTemplates, seed);

    // 5. Generar cada nivel
    const levels = [];
    
    for (let i = 0; i < numLevels; i++) {
      const template = shuffledTemplates[i % shuffledTemplates.length];
      
      // Verificar que haya datos del tipo necesario
      const availableData = groupedData[template.dataType];
      if (!availableData || availableData.length === 0) {
        console.warn(`⚠️ No hay datos de tipo ${template.dataType}, saltando...`);
        continue;
      }

      // Crear nivel
      const level = new Level({
        title: template.name,
        description: template.description,
        order: i + 1,
        challenges: [],
        userId: creatorId,
        gameSetId: gameSetId,
        completed: false
      });

      await level.save();
      console.log(`✅ Nivel ${i + 1}: ${level.title}`);

      // Generar challenges para este nivel
      const challenges = await generateChallenges(
        level._id,
        availableData,
        seed,
        template.challengesPerLevel || 3
      );

      level.challenges = challenges.map(c => c._id);
      await level.save();

      levels.push(level);
    }

    return levels;

  } catch (error) {
    console.error('Error generando niveles:', error);
    throw error;
  }
};

/**
 * Verificar si un nivel está completado
 */
const checkLevelCompletion = async (levelId) => {
  const level = await Level.findById(levelId).populate('challenges');
  
  if (!level) return false;

  const allCompleted = level.challenges.every(c => c.completed);

  if (allCompleted && !level.completed) {
    level.completed = true;
    level.completedAt = new Date();
    await level.save();
    return true;
  }

  return level.completed;
};

module.exports = {
  generateLevels,
  checkLevelCompletion
};
```

---

## 🧪 Tests (Ejemplos con Jest)

### 1. Test de Autenticación

```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const { User } = require('../src/models');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!',
          role: 'creator'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        passwordHash: 'hashedpassword',
        role: 'player'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      // Crear usuario primero
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!'
        });

      // Login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123!'
        });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

**✨ Estos ejemplos están listos para usar y adaptar según tus necesidades!**
