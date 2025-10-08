import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserPrizes } from '../hooks/useGame';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const MyPrizesScreen = ({ navigation }) => {
  const { prizes, isLoading, deletePrize, refetch } = useUserPrizes();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEdit = (prize) => {
    navigation.navigate('EditPrize', { prize, mode: 'edit' });
  };

  const handleDelete = (prize) => {
    Alert.alert(
      'Eliminar Premio',
      '¿Estás seguro de eliminar este premio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePrize(prize._id),
        },
      ]
    );
  };

  const handleAddNew = () => {
    navigation.navigate('EditPrize', { mode: 'create' });
  };

  if (isLoading) {
    return <LoadingOverlay message="Cargando premios..." />;
  }

  const userPrizes = prizes?.userPrizes || [];
  const systemPrizes = prizes?.systemPrizes || [];

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
            Crea tus propios premios o usa los del sistema
          </Text>
        </View>

        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <AppButton
            title="Crear Nuevo Premio"
            onPress={handleAddNew}
            icon="🎁"
          />
        </View>

        {/* Mis Premios */}
        {userPrizes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis Premios Personalizados</Text>
            <View style={styles.prizesGrid}>
              {userPrizes.map((prize) => (
                <PrizeCard
                  key={prize._id}
                  prize={prize}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canEdit={true}
                />
              ))}
            </View>
          </View>
        )}

        {/* Premios del Sistema */}
        {systemPrizes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premios del Sistema</Text>
            <Text style={styles.sectionSubtitle}>
              Estos premios también pueden salirte al completar el juego
            </Text>
            <View style={styles.prizesGrid}>
              {systemPrizes.map((prize) => (
                <PrizeCard
                  key={prize._id}
                  prize={prize}
                  canEdit={false}
                />
              ))}
            </View>
          </View>
        )}

        {userPrizes.length === 0 && systemPrizes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyTitle}>No hay premios aún</Text>
            <Text style={styles.emptyText}>
              Crea premios personalizados para que aparezcan al completar el juego
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Componente de tarjeta de premio
const PrizeCard = ({ prize, onEdit, onDelete, canEdit }) => {
  return (
    <View style={styles.prizeCard}>
      <View style={styles.prizeImageContainer}>
        {prize.imagePath ? (
          <Image
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${prize.imagePath}` }}
            style={styles.prizeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.prizeImagePlaceholder}>
            <Text style={styles.prizeImageEmoji}>🏆</Text>
          </View>
        )}
        {prize.used && (
          <View style={styles.usedBadge}>
            <Text style={styles.usedBadgeText}>Usado</Text>
          </View>
        )}
      </View>

      <View style={styles.prizeContent}>
        <Text style={styles.prizeTitle} numberOfLines={2}>{prize.title}</Text>
        <Text style={styles.prizeDescription} numberOfLines={3}>
          {prize.description}
        </Text>

        <View style={styles.prizeFooter}>
          <View style={styles.prizeMetadata}>
            <Text style={styles.prizeWeight}>Peso: {prize.weight}/10</Text>
            {prize.category && (
              <Text style={styles.prizeCategory}>{prize.category}</Text>
            )}
          </View>

          {canEdit && (
            <View style={styles.prizeActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(prize)}
              >
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteActionButton]}
                onPress={() => onDelete(prize)}
              >
                <Text style={styles.actionButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  addButtonContainer: {
    padding: 24,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  prizesGrid: {
    gap: 16,
  },
  prizeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  prizeImageContainer: {
    position: 'relative',
    height: 150,
  },
  prizeImage: {
    width: '100%',
    height: '100%',
  },
  prizeImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeImageEmoji: {
    fontSize: 48,
  },
  usedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  usedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  prizeContent: {
    padding: 16,
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  prizeDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  prizeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeMetadata: {
    flex: 1,
  },
  prizeWeight: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  prizeCategory: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  prizeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionButton: {
    backgroundColor: '#FFE0E0',
  },
  actionButtonText: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
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