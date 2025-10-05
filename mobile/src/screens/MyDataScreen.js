import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserData } from '../hooks/useGame';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const MyDataScreen = ({ navigation }) => {
  const { userData, isLoading, deleteData, refetch } = useUserData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleEdit = (item) => {
    navigation.navigate('EditData', { dataItem: item, mode: 'edit' });
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Eliminar Dato',
      '¿Estás seguro de eliminar este dato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteData(item._id),
        },
      ]
    );
  };

  const handleAddNew = () => {
    navigation.navigate('EditData', { mode: 'create' });
  };

  if (isLoading) {
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
          <Text style={styles.title}>Mis Datos Personales</Text>
          <Text style={styles.subtitle}>
            Estos datos se usarán para generar tus retos personalizados
          </Text>
        </View>

        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <AppButton
            title="Añadir Nuevo Dato"
            onPress={handleAddNew}
            icon="➕"
          />
        </View>

        {/* Data List */}
        {userData && userData.length > 0 ? (
          <View style={styles.dataContainer}>
            {userData.map((item) => (
              <View key={item._id} style={styles.dataCard}>
                <View style={styles.dataHeader}>
                  <View style={styles.dataBadge}>
                    <Text style={styles.dataBadgeText}>{item.tipoDato}</Text>
                  </View>
                  {item.categorias && item.categorias.length > 0 && (
                    <View style={styles.categories}>
                      {item.categorias.map((cat, idx) => (
                        <Text key={idx} style={styles.categoryTag}>
                          {cat}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                <Text style={styles.dataQuestion}>{item.pregunta}</Text>
                <Text style={styles.dataValue}>Respuesta: {item.valor}</Text>

                {item.pistas && item.pistas.length > 0 && (
                  <View style={styles.hintsContainer}>
                    <Text style={styles.hintsLabel}>
                      {item.pistas.length} pista(s)
                    </Text>
                  </View>
                )}

                <View style={styles.dataActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.actionButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.actionButtonTextDelete}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No tienes datos aún</Text>
            <Text style={styles.emptyText}>
              Añade información personal que se usará para crear retos únicos para ti
            </Text>
          </View>
        )}
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
  dataContainer: {
    padding: 24,
    paddingTop: 0,
  },
  dataCard: {
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
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataBadge: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dataBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    color: '#666666',
  },
  dataQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  hintsContainer: {
    marginBottom: 12,
  },
  hintsLabel: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '500',
  },
  dataActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  actionButtonTextDelete: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
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

export default MyDataScreen;