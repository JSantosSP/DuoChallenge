import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text,
  Alert
} from 'react-native';
import { colors } from '../utils/colors';

const { width: screenWidth } = Dimensions.get('window');
const PUZZLE_SIZE = Math.min(screenWidth - 48, 400); // Tamaño del puzzle con margen

/**
 * Componente de puzzle interactivo
 * Divide una imagen en piezas y permite reordenarlas
 */
const PuzzleGame = ({ imageUri, gridSize = 3, onComplete, style }) => {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const pieceSize = PUZZLE_SIZE / gridSize;

  useEffect(() => {
    initializePuzzle();
  }, [imageUri, gridSize]);

  // Inicializar el puzzle con piezas desordenadas
  const initializePuzzle = () => {
    const totalPieces = gridSize * gridSize;
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => ({
      id: i + 1, // ID de la pieza (1 a 9 para 3x3)
      currentPosition: i, // Posición actual en el grid
      correctPosition: i, // Posición correcta en el grid
    }));

    // Desordenar las piezas
    const shuffled = shuffleArray(initialPieces);
    shuffled.forEach((piece, index) => {
      piece.currentPosition = index;
    });

    setPieces(shuffled);
  };

  // Algoritmo de Fisher-Yates para desordenar
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Asegurar que al menos una pieza esté fuera de lugar
    const isSolved = shuffled.every((piece, index) => piece.id === index + 1);
    if (isSolved) {
      return shuffleArray(array); // Volver a desordenar
    }
    return shuffled;
  };

  // Manejar selección y swap de piezas
  const handlePiecePress = (index) => {
    if (selectedPiece === null) {
      // Primera selección
      setSelectedPiece(index);
    } else {
      if (selectedPiece === index) {
        // Deseleccionar si se presiona la misma pieza
        setSelectedPiece(null);
      } else {
        // Intercambiar piezas
        swapPieces(selectedPiece, index);
        setSelectedPiece(null);
      }
    }
  };

  // Intercambiar dos piezas
  const swapPieces = (index1, index2) => {
    const newPieces = [...pieces];
    [newPieces[index1], newPieces[index2]] = [newPieces[index2], newPieces[index1]];
    
    // Actualizar posiciones actuales
    newPieces[index1].currentPosition = index1;
    newPieces[index2].currentPosition = index2;
    
    setPieces(newPieces);

    // Verificar si el puzzle está completo
    checkCompletion(newPieces);
  };

  // Verificar si el puzzle está completo
  const checkCompletion = (currentPieces) => {
    const isComplete = currentPieces.every((piece, index) => piece.id === index + 1);
    
    if (isComplete) {
      // Obtener el orden actual para enviar al backend
      const order = currentPieces.map(piece => piece.id);
      Alert.alert(
        '¡Felicitaciones! 🎉',
        'Has completado el puzzle correctamente',
        [{ text: 'OK', onPress: () => onComplete && onComplete(order) }]
      );
    }
  };

  // Obtener la posición de recorte de la imagen original para cada pieza
  const getPieceImageStyle = (piece) => {
    const row = Math.floor(piece.correctPosition / gridSize);
    const col = piece.correctPosition % gridSize;
    
    return {
      width: PUZZLE_SIZE,
      height: PUZZLE_SIZE,
      position: 'absolute',
      left: -col * pieceSize,
      top: -row * pieceSize,
    };
  };

  // Renderizar una pieza del puzzle
  const renderPiece = (piece, index) => {
    const isSelected = selectedPiece === index;
    
    return (
      <TouchableOpacity
        key={`piece-${index}`}
        style={[
          styles.piece,
          {
            width: pieceSize,
            height: pieceSize,
            borderWidth: isSelected ? 3 : 1,
            borderColor: isSelected ? colors.forest.medium : '#FFFFFF',
          },
        ]}
        onPress={() => handlePiecePress(index)}
        activeOpacity={0.7}
      >
        <View style={{ overflow: 'hidden', width: pieceSize, height: pieceSize }}>
          <Image
            source={{ uri: imageUri }}
            style={getPieceImageStyle(piece)}
            resizeMode="cover"
          />
        </View>
        {/* Número de pieza para debug (opcional) */}
        {/* <View style={styles.pieceNumber}>
          <Text style={styles.pieceNumberText}>{piece.id}</Text>
        </View> */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Toca dos piezas para intercambiarlas
        </Text>
        {selectedPiece !== null && (
          <Text style={styles.selectedText}>
            Selecciona otra pieza para intercambiar
          </Text>
        )}
      </View>
      
      <View 
        style={[
          styles.puzzleContainer,
          { width: PUZZLE_SIZE, height: PUZZLE_SIZE }
        ]}
      >
        {pieces.map((piece, index) => renderPiece(piece, index))}
      </View>

      <TouchableOpacity 
        style={styles.resetButton}
        onPress={initializePuzzle}
      >
        <Text style={styles.resetButtonText}>🔄 Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  instructions: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  instructionsText: {
    fontSize: 14,
    color: '#2C5282',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 12,
    color: colors.forest.medium,
    marginTop: 4,
    fontWeight: '600',
  },
  puzzleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  piece: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pieceNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
});

export default PuzzleGame;
