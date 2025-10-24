import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWonPrizes } from '../hooks/useGame';
import { apiService } from '../api/api';
import LoadingOverlay from '../components/LoadingOverlay';
import AppButton from '../components/AppButton';

const WonPrizesScreen = ({ navigation }) => {
  const { wonPrizes, isLoading, refetch, total } = useWonPrizes();
  const [refreshing, setRefreshing] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeightColor = (weight) => {
    if (weight <= 3) return '#4CAF50'; // Verde
    if (weight <= 6) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const getWeightLabel = (weight) => {
    if (weight <= 3) return 'Pequeño';
    if (weight <= 6) return 'Mediano';
    return 'Grande';
  };

  const handleReactivatePrize = async (prizeId) => {
    Alert.alert(
      'Reactivar Premio',
      '¿Quieres reactivar este premio para poder canjearlo nuevamente?',
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
              const message = error.response?.data?.message || 'Error al reactivar premio';
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
    const usedPrizes = wonPrizes.filter(p => p.used);
    if (usedPrizes.length === 0) {
      Alert.alert('Info', 'No tienes premios canjeados para reactivar');
      return;
    }

    Alert.alert(
      'Reactivar Todos',
      `¿Quieres reactivar todos los ${usedPrizes.length} premios canjeados?`,
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
              const message = error.response?.data?.message || 'Error al reactivar premios';
              Alert.alert('Error', message);
            } finally {
              setReactivating(false);
            }
          },
        },
      ]
    );
  };

  const renderPrizeCard = (prize, index) => (
    <View key={index} style={styles.prizeCard}>
      {prize.imagePath && (
        <Image
          source={{ uri: prize.imagePath }}
          style={styles.prizeImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.prizeInfo}>
        <View style={styles.prizeHeader}>
          <Text style={styles.prizeTitle}>{prize.title}</Text>
          {prize.used && (
            <View style={styles.usedBadge}>
              <Text style={styles.usedText}>✓ Canjeado</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.prizeDescription} numberOfLines={2}>
          {prize.description}
        </Text>

        <View style={styles.prizeMeta}>
          <View style={[styles.weightBadge, { backgroundColor: getWeightColor(prize.weight) }]}>
            <Text style={styles.weightText}>
              {getWeightLabel(prize.weight)} ({prize.weight}/10)
            </Text>
          </View>
        </View>

        <View style={styles.prizeDates}>
          <Text style={styles.dateText}>
            🎉 Ganado: {formatDate(prize.completedAt)}
          </Text>
          {prize.usedAt && (
            <Text style={styles.dateText}>
              ✓ Canjeado: {formatDate(prize.usedAt)}
            </Text>
          )}
        </View>

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
    </View>
  );

  if (isLoading && !refreshing) {
    return <LoadingOverlay message="Cargando premios ganados..." />;
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
          <Text style={styles.title}>Mis Premios Ganados 🏆</Text>
          <Text style={styles.subtitle}>
            {total === 0
              ? 'Completa juegos para ganar premios'
              : `Has ganado ${total} premio${total !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Stats Card */}
        {total > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {wonPrizes.filter(p => p.used).length}
              </Text>
              <Text style={styles.statLabel}>Canjeados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {wonPrizes.filter(p => !p.used).length}
              </Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
          </View>
        )}

        {/* Reactivate All Button */}
        {wonPrizes.filter(p => p.used).length > 0 && (
          <View style={styles.actionSection}>
            <AppButton
              title="Reactivar Todos los Premios Canjeados"
              onPress={handleReactivateAll}
              icon="🔄"
              variant="outline"
              disabled={reactivating}
            />
          </View>
        )}

        {/* Prizes List */}
        <View style={styles.section}>
          {wonPrizes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎁</Text>
              <Text style={styles.emptyTitle}>
                Aún no has ganado premios
              </Text>
              <Text style={styles.emptyText}>
                Completa juegos para ganar premios sorpresa
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.emptyButtonText}>
                  Ir a Jugar
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {wonPrizes.map((prize, index) => renderPrizeCard(prize, index))}
            </>
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
    color: '#FF6B9D',
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
  section: {
    padding: 24,
    paddingTop: 0,
  },
  prizeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  prizeImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
  },
  prizeInfo: {
    gap: 8,
  },
  prizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  prizeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  usedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  prizeDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  prizeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  weightText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  prizeDates: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 16,
  },
  reactivateButton: {
    marginTop: 12,
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

export default WonPrizesScreen;
