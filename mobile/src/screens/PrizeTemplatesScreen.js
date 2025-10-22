import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrize } from '../hooks/usePrize';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';

const PrizeTemplatesScreen = ({ navigation }) => {
  const { prizeTemplates, loading, fetchPrizeTemplates } = usePrize();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrizeTemplates();
    setRefreshing(false);
  };

  const handleSelectTemplate = (template) => {
    navigation.navigate('EditPrize', { template });
  };

  const handleCreateFromScratch = () => {
    navigation.navigate('EditPrize', { template: null });
  };

  if (loading && !refreshing) {
    return <LoadingOverlay message="Cargando plantillas..." />;
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
          <Text style={styles.title}>Plantillas de Premios</Text>
          <Text style={styles.subtitle}>
            Selecciona una plantilla para crear tu premio
          </Text>
        </View>

        {/* Create from scratch button */}
        <View style={styles.section}>
          <AppButton
            title="Crear desde cero"
            onPress={handleCreateFromScratch}
            icon="✨"
            variant="secondary"
          />
        </View>

        {/* Templates List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plantillas disponibles</Text>
          {prizeTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎁</Text>
              <Text style={styles.emptyTitle}>No hay plantillas disponibles</Text>
              <Text style={styles.emptyText}>
                Por ahora solo puedes crear premios desde cero
              </Text>
            </View>
          ) : (
            prizeTemplates.map((template) => (
              <TouchableOpacity
                key={template._id}
                style={styles.templateCard}
                onPress={() => handleSelectTemplate(template)}
              >
                {template.imagePath && (
                  <Image
                    source={{ uri: template.imagePath }}
                    style={styles.templateImage}
                  />
                )}
                <View style={styles.templateInfo}>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDescription} numberOfLines={2}>
                    {template.description}
                  </Text>
                  <View style={styles.templateMeta}>
                    <Text style={styles.templateWeight}>
                      Peso: {template.weight || 1}
                    </Text>
                  </View>
                </View>
                <Text style={styles.templateArrow}>→</Text>
              </TouchableOpacity>
            ))
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
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  templateCard: {
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
  templateImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateWeight: {
    fontSize: 12,
    color: '#FF6B9D',
    fontWeight: '500',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateArrow: {
    fontSize: 20,
    color: '#FF6B9D',
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

export default PrizeTemplatesScreen;
