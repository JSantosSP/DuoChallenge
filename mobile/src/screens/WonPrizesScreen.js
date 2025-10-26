import React,  { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWonPrizes } from '../hooks/useGame';
import { getImageUrl } from '../api/api';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const WonPrizesScreen = ({ navigation }) => {
  const { wonPrizes, isLoading, refetch, total } = useWonPrizes();
  const [refreshing, setRefreshing] = useState(false);

  // Configurar botón back personalizado para navegar a Home
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            // Volver al inicio del stack (HomeScreen)
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
          style={{ marginLeft: 16, padding: 8 }}
        >
          <Text style={{ fontSize: 34, color: colors.neutral.textLight }}>‹</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    if (weight <= 6) return colors.status.warning; // Naranja
    return colors.status.error; // Rojo
  };

  const getWeightLabel = (weight) => {
    if (weight <= 3) return 'Pequeño';
    if (weight <= 6) return 'Mediano';
    return 'Grande';
  };


  const renderPrizeCard = (prize, index) => (
      <View key={index} style={styles.prizeCard}>
        {prize.imagePath && (
          <Image
            source={{ uri: getImageUrl(prize.imagePath) }}
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
    backgroundColor: colors.forest.medium,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WonPrizesScreen;
