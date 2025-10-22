import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUserData } from '../hooks/useUserData';
import { apiService } from '../api/api';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const MyDataScreen = ({ navigation, route }) => {
  const { userData, availableTypes, categories, loading, refetch } = useUserData();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, text, date, photo, location

  // Refresh data when screen becomes visible
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Eliminar Dato',
      '¿Estás seguro de que quieres eliminar este dato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteUserData(item._id),
        },
      ]
    );
  };

  const deleteUserData = async (id) => {
    try {
      await apiService.deleteUserData(id);
      await refetch();
      Alert.alert('Éxito', 'Dato eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el dato');
    }
  };

  const getTypeIcon = (typeId) => {
    const type = availableTypes.find(t => t._id === typeId);
    switch (type?.type) {
      case 'texto': return '📝';
      case 'fecha': return '📅';
      case 'foto': return '📸';
      case 'lugar': return '📍';
      default: return '❓';
    }
  };

  const getTypeName = (typeId) => {
    const type = availableTypes.find(t => t._id === typeId);
    return type?.type || 'Desconocido';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const filteredData = userData.filter(item => {
    if (filter === 'all') return true;
    const type = availableTypes.find(t => t._id === item.tipoDato);
    return type?.type === filter;
  });

  if (loading && !refreshing) {
    return <LoadingOverlay message="Cargando tus datos..." />;
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
          <Text style={styles.title}>Mis Datos</Text>
          <Text style={styles.subtitle}>
            Gestiona tu información personal para los juegos
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {availableTypes.map((type) => (
              <TouchableOpacity
                key={type._id}
                style={[styles.filterButton, filter === type.type && styles.filterActive]}
                onPress={() => setFilter(type.type)}
              >
                <Text style={[styles.filterText, filter === type.type && styles.filterTextActive]}>
                  {getTypeIcon(type._id)} {type.type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Data List */}
        <View style={styles.section}>
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? 'No tienes datos aún' : `No tienes datos de tipo ${filter}`}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'all' 
                  ? 'Crea tu primer dato para empezar a jugar'
                  : `Crea un dato de tipo ${filter} para verlo aquí`
                }
              </Text>
            </View>
          ) : (
            filteredData.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.dataCard}
                onPress={() => navigation.navigate('EditData', { item })}
              >
                <View style={styles.dataIcon}>
                  <Text style={styles.dataIconText}>
                    {getTypeIcon(item.tipoDato)}
                  </Text>
                </View>
                <View style={styles.dataInfo}>
                  <Text style={styles.dataTitle}>{item.pregunta}</Text>
                  <Text style={styles.dataSubtitle}>
                    {getTypeName(item.tipoDato)} • {getCategoryName(item.categorias)}
                  </Text>
                  {item.pistas && item.pistas.length > 0 && (
                    <Text style={styles.dataHints}>
                      {item.pistas.length} pista{item.pistas.length > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add Button */}
        <View style={styles.section}>
          <AppButton
            title="Agregar Nuevo Dato"
            onPress={() => navigation.navigate('AddData')}
            icon="➕"
          />
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
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  dataCard: {
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
  dataIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dataIconText: {
    fontSize: 24,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  dataSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  dataHints: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default MyDataScreen;