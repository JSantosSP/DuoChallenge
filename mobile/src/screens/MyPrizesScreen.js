import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { usePrize } from '../hooks/usePrize';
import { apiService } from '../api/api';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const MyPrizesScreen = ({ navigation, route }) => {
  const { userPrizes, loading, refetch, deletePrize } = usePrize();
  const [refreshing, setRefreshing] = useState(false);
  const [reactivating, setReactivating] = useState(false);

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

  const handleDelete = (prize) => {
    Alert.alert(
      'Eliminar Premio',
      '¿Estás seguro de que quieres eliminar este premio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePrizeItem(prize._id),
        },
      ]
    );
  };

  const deletePrizeItem = async (id) => {
    try {
      const result = await deletePrize(id);
      if (result.success) {
        Alert.alert('Éxito', 'Premio eliminado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el premio');
    }
  };

  const getWeightColor = (weight) => {
    if (weight <= 3) return '#4CAF50'; // Verde
    if (weight <= 6) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const handleReactivatePrize = async (prizeId) => {
    Alert.alert(
      'Reactivar Premio',
      '¿Quieres reactivar este premio para poder usarlo nuevamente en futuros juegos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reactivar',
          onPress: async () => {
            try {
              setReactivating(true);
              await apiService.reactivatePrize(prizeId);
              Alert.alert('✅ Éxito', 'Premio reactivado correctamente');
              await refetch();
            } catch (error) {
              const message = error.response?.data?.message || 'Error al reactivar premio. Este endpoint aún no está implementado en el backend.';
              Alert.alert('Error', message);
            } finally {
              setReactivating(false);
            }
          },
        },
      ]
    );
  };

  const handleReactivateAll = () => {
    const usedPrizes = userPrizes.filter(p => p.used);
    if (usedPrizes.length === 0) {
      Alert.alert('Info', 'No tienes premios usados para reactivar');
      return;
    }

    Alert.alert(
      'Reactivar Todos',
      `¿Quieres reactivar todos los ${usedPrizes.length} premios usados?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reactivar Todos',
          onPress: async () => {
            try {
              setReactivating(true);
              await apiService.reactivateAllPrizes();
              Alert.alert('✅ Éxito', 'Todos los premios han sido reactivados');
              await refetch();
            } catch (error) {
              const message = error.response?.data?.message || 'Error al reactivar premios. Este endpoint aún no está implementado en el backend.';
              Alert.alert('Error', message);
            } finally {
              setReactivating(false);
            }
          },
        },
      ]
    );
  };

  const renderPrizeCard = (prize) => (
    <View key={prize._id} style={styles.prizeCardContainer}>
      <TouchableOpacity
        style={styles.prizeCard}
        onPress={() => navigation.navigate('EditPrize', { prize })}
      >
        {prize.imagePath && (
          <Image
            source={{ uri: prize.imagePath }}
            style={styles.prizeImage}
          />
        )}
        <View style={styles.prizeInfo}>
          <View style={styles.prizeHeader}>
            <Text style={styles.prizeTitle}>{prize.title}</Text>
          </View>
          <Text style={styles.prizeDescription} numberOfLines={2}>
            {prize.description}
          </Text>
          <View style={styles.prizeMeta}>
            <View style={[styles.weightBadge, { backgroundColor: getWeightColor(prize.weight) }]}>
              <Text style={styles.weightText}>Peso: {prize.weight}</Text>
            </View>
            {prize.used && (
              <View style={styles.usedBadge}>
                <Text style={styles.usedText}>Usado</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(prize)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      
      {/* Reactivate button for used prizes */}
      {prize.used && (
        <TouchableOpacity
          style={styles.reactivateButton}
          onPress={() => handleReactivatePrize(prize._id)}
          disabled={reactivating}
        >
          <Text style={styles.reactivateButtonText}>
            🔄 Reactivar Premio
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingOverlay message="Cargando premios..." />;
  }

  const allPrizes = userPrizes;

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
          <Text style={styles.title}>Mis Premios</Text>
          <Text style={styles.subtitle}>
            Gestiona tus premios para los juegos
          </Text>
        </View>

        {/* Stats and Reactivate All Button */}
        {allPrizes.filter(p => p.used).length > 0 && (
          <View style={styles.actionSection}>
            <View style={styles.usedPrizesInfo}>
              <Text style={styles.usedPrizesText}>
                {allPrizes.filter(p => p.used).length} premio(s) usado(s)
              </Text>
            </View>
            <AppButton
              title="Reactivar Todos los Premios Usados"
              onPress={handleReactivateAll}
              icon="🔄"
              variant="outline"
              disabled={reactivating}
            />
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, styles.filterActive]}
            >
              <Text style={[styles.filterText, styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Prizes List */}
        <View style={styles.section}>
          {allPrizes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎁</Text>
              <Text style={styles.emptyTitle}>
                {'No tienes premios aún'}
              </Text>
              <Text style={styles.emptyText}>
                {'Crea tu primer premio para empezar a jugar'}
              </Text>
            </View>
          ) : (
            allPrizes.map((prize) => renderPrizeCard(prize))
          )}
        </View>

        {/* Add Button */}
        <View style={styles.section}>
          <AppButton
            title="Agregar Nuevo Premio"
            onPress={() => navigation.navigate('PrizeTemplates')}
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
  prizeCard: {
    flexDirection: 'row',
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
  prizeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  prizeInfo: {
    flex: 1,
  },
  prizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  prizeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  prizeCategory: {
    fontSize: 12,
    color: '#666666',
  },
  prizeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  prizeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  usedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  usedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  systemText: {
    fontSize: 12,
    color: '#FF6B9D',
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    alignSelf: 'flex-start',
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
  prizeCardContainer: {
    marginBottom: 12,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  usedPrizesInfo: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  usedPrizesText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    textAlign: 'center',
  },
  reactivateButton: {
    marginTop: 8,
    marginHorizontal: 24,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  reactivateButtonText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyPrizesScreen;