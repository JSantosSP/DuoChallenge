import React,  { useState } from 'react';
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
import { getImageUrl } from '../api/api';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const MyPrizesScreen = ({ navigation, route }) => {
  const { userPrizes, loading, refetch, deletePrize, reactivatePrize, reactivateAllPrizes } = usePrize();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleReactivatePrize = async (prizeId) => {
    Alert.alert(
      'Reiniciar Premio',
      '¿Seguro que deseas reiniciar este premio? Volverá a estar disponible para ser canjeado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, reiniciar',
          onPress: async () => {
            const result = await reactivatePrize(prizeId);
            if (result.success) {
              Alert.alert('✅ Éxito', 'Premio reiniciado correctamente');
              await refetch();
            }
          },
        },
      ]
    );
  };

  const handleReactivateAllPrizes = async () => {
    const usedPrizes = userPrizes.filter(p => p.used);
    if (usedPrizes.length === 0) {
      Alert.alert('Info', 'No tienes premios canjeados para reiniciar');
      return;
    }

    Alert.alert(
      'Reiniciar Todos los Premios',
      `Esta acción reiniciará todos los ${usedPrizes.length} premios canjeados. ¿Deseas continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar Todos',
          onPress: async () => {
            const result = await reactivateAllPrizes();
            if (result.success) {
              Alert.alert(
                '✅ Éxito', 
                `Se han reiniciado ${result.count} premio(s) correctamente`
              );
              await refetch();
            }
          },
        },
      ]
    );
  };

  const getWeightColor = (weight) => {
    if (weight <= 3) return '#4CAF50'; // Verde
    if (weight <= 6) return colors.status.warning; // Naranja
    return colors.status.error; // Rojo
  };

  const renderPrizeCard = (prize) => (
    <View key={prize._id} style={styles.prizeCard}>
      <TouchableOpacity
        style={styles.prizeCardContent}
        onPress={() => navigation.navigate('EditPrize', { prize })}
      >
        {prize.imagePath && (
          <Image
            source={{ uri: getImageUrl(prize.imagePath) }}
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
                <Text style={styles.usedText}>✓ Canjeado</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(prize);
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      
      {/* Botón de reinicio solo para premios canjeados */}
      {prize.used && (
        <TouchableOpacity
          style={styles.reactivateButton}
          onPress={(e) => {
            e.stopPropagation();
            handleReactivatePrize(prize._id);
          }}
        >
          <Text style={styles.reactivateButtonText}>
            🔄 Reiniciar Premio
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

        {/* Stats Card */}
        {allPrizes.length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{allPrizes.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {allPrizes.filter(p => p.used).length}
              </Text>
              <Text style={styles.statLabel}>Canjeados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {allPrizes.filter(p => !p.used).length}
              </Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
          </View>
        )}

        {/* Reactivate All Button */}
        {allPrizes.filter(p => p.used).length > 0 && (
          <View style={styles.actionSection}>
            <AppButton
              title="🧹 Reiniciar Todos los Premios Canjeados"
              onPress={handleReactivateAllPrizes}
              variant="outline"
            />
          </View>
        )}

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
    backgroundColor: colors.neutral.backgroundLight,
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.forest.medium,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 16,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  prizeCard: {
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
  prizeCardContent: {
    flexDirection: 'row',
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
    color: colors.forest.medium,
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
  reactivateButton: {
    marginTop: 12,
    backgroundColor: colors.forest.light,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.forest.medium,
  },
  reactivateButtonText: {
    color: colors.forest.medium,
    fontSize: 14,
    fontWeight: '600',
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

export default MyPrizesScreen;
