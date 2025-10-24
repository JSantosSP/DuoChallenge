# Fix de Reinicio de Juego en Settings

## 📋 Descripción General

Este documento detalla los cambios implementados en la pantalla de Settings (`SettingsScreen`) y la pantalla de Premio (`PrizeScreen`) para mejorar la funcionalidad de reinicio de juego, permitiendo a los usuarios generar nuevos juegos desde códigos compartidos de manera intuitiva.

## 🎯 Objetivos

1. ✅ Mantener el botón "Reiniciar juego" en Settings con nueva funcionalidad
2. ✅ Mostrar códigos compartidos (GameShare) disponibles para el usuario
3. ✅ Permitir seleccionar un código y generar un nuevo GameSet
4. ✅ Manejar correctamente el caso de códigos ya usados (sin error)
5. ✅ Mantener funcionalidad de reinicio en PrizeScreen

## 🔧 Cambios Implementados

### 1. SettingsScreen - Nueva Funcionalidad

**Archivo:** `/workspace/mobile/src/screens/SettingsScreen.js`

#### Imports Añadidos

```javascript
import React, { useState } from 'react';
import {
  // ... existentes ...
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useGame, useGameShare } from '../hooks/useGame';
```

#### Estado Añadido

```javascript
const [showRestartModal, setShowRestartModal] = useState(false);
const [restarting, setRestarting] = useState(false);
const [availableShareCodes, setAvailableShareCodes] = useState([]);
```

#### Hooks Utilizados

```javascript
const { stats, restartGame, activeGames, refetchActiveGames } = useGame();
```

#### Nueva Función: handleRestartGame

```javascript
const handleRestartGame = async () => {
  // 1. Refrescar juegos activos
  await refetchActiveGames();
  
  // 2. Extraer códigos únicos de juegos compartidos
  const shareCodes = [];
  const seenCodes = new Set();
  
  (activeGames || []).forEach(game => {
    if (game.shareCode && game.shareId && !seenCodes.has(game.shareCode)) {
      seenCodes.add(game.shareCode);
      shareCodes.push({
        code: game.shareCode,
        creatorId: game.creatorId,
        shareId: game.shareId._id || game.shareId,
      });
    }
  });

  // 3. Validar que hay códigos disponibles
  if (shareCodes.length === 0) {
    Alert.alert(
      'No hay códigos disponibles',
      'No tienes códigos compartidos disponibles para reiniciar un juego. Únete a un juego primero en la sección "Unirse a Juego".',
      [{ text: 'Entendido' }]
    );
    return;
  }

  // 4. Mostrar modal con códigos
  setAvailableShareCodes(shareCodes);
  setShowRestartModal(true);
};
```

#### Nueva Función: handleSelectShareCode

```javascript
const handleSelectShareCode = async (shareCodeObj) => {
  setShowRestartModal(false);
  
  Alert.alert(
    'Reiniciar Juego',
    `¿Quieres crear un nuevo juego usando el código de ${shareCodeObj.creatorId?.name || 'tu pareja'}?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reiniciar',
        onPress: async () => {
          try {
            setRestarting(true);
            await restartGame({ shareCode: shareCodeObj.code });
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (error) {
            console.error('Error restarting game:', error);
          } finally {
            setRestarting(false);
          }
        },
      },
    ]
  );
};
```

#### Nuevo Componente: Botón Reiniciar Juego

```javascript
<TouchableOpacity 
  style={styles.actionCard} 
  onPress={handleRestartGame}
  disabled={restarting}
>
  <Text style={styles.actionIcon}>🔄</Text>
  <View style={styles.actionInfo}>
    <Text style={styles.actionTitle}>Reiniciar Juego</Text>
    <Text style={styles.actionDescription}>
      Genera un nuevo juego desde un código compartido
    </Text>
  </View>
</TouchableOpacity>
```

#### Nuevo Modal: Selector de Códigos

```javascript
<Modal
  visible={showRestartModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowRestartModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Selecciona un Código</Text>
        <TouchableOpacity
          onPress={() => setShowRestartModal(false)}
          style={styles.modalCloseButton}
        >
          <Text style={styles.modalCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        {availableShareCodes.map((shareCode, index) => (
          <TouchableOpacity
            key={shareCode.code || index}
            style={styles.shareCodeCard}
            onPress={() => handleSelectShareCode(shareCode)}
          >
            {/* Card content */}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </View>
</Modal>
```

#### Overlay de Carga

```javascript
{restarting && (
  <View style={styles.loadingOverlay}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B9D" />
      <Text style={styles.loadingText}>Reiniciando juego...</Text>
    </View>
  </View>
)}
```

---

### 2. Estilos Añadidos

```javascript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
},
modalContainer: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: '80%',
  paddingBottom: 24,
},
shareCodeCard: {
  backgroundColor: '#FFF5F8',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: '#FF6B9D',
},
loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},
// ... más estilos
```

---

### 3. PrizeScreen - Funcionalidad Existente

**Archivo:** `/workspace/mobile/src/screens/PrizeScreen.js`

La funcionalidad ya existía pero se mantiene sin cambios:

```javascript
const handleNewGame = async () => {
  if (!shareCode) {
    Alert.alert(
      'No se puede reiniciar',
      'Este juego no tiene un código de compartición válido. Solo puedes reiniciar juegos compartidos por otra persona.',
      [{ text: 'Entendido', onPress: () => navigation.navigate('Home') }]
    );
    return;
  }

  try {
    await restartGame({ shareCode });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  } catch (error) {
    console.error('Error restarting game:', error);
  }
};
```

---

## 🎮 Flujo de Usuario

### Flujo Principal: Reiniciar desde Settings

```
1. Usuario navega a Settings
         ↓
2. Presiona "🔄 Reiniciar Juego"
         ↓
3. Sistema obtiene juegos activos compartidos
         ↓
4. Extrae códigos únicos disponibles
         ↓
    ¿Hay códigos?
    ↙         ↘
  No          Sí
   ↓           ↓
Mostrar     Mostrar modal
 Alert      con códigos
             ↓
5. Usuario selecciona código
         ↓
6. Confirmar acción
         ↓
7. Llamar restartGame()
         ↓
8. Generar nuevo GameSet
         ↓
9. Navegar a Home
         ↓
10. Iniciar nuevo juego
```

### Flujo Alternativo: Reiniciar desde Prize

```
1. Usuario completa juego
         ↓
2. Ve pantalla de premio
         ↓
3. Presiona "Iniciar Nuevo Juego"
         ↓
4. Sistema usa shareCode del juego actual
         ↓
    ¿Tiene shareCode?
    ↙              ↘
  No               Sí
   ↓                ↓
Mostrar        Llamar restartGame()
 Alert              ↓
             Generar nuevo GameSet
                    ↓
              Navegar a Home
```

---

## 🔍 Lógica de Códigos Disponibles

### Extracción de Códigos

```javascript
const shareCodes = [];
const seenCodes = new Set();

(activeGames || []).forEach(game => {
  // Solo juegos con shareCode y shareId (juegos compartidos)
  if (game.shareCode && game.shareId && !seenCodes.has(game.shareCode)) {
    seenCodes.add(game.shareCode);
    shareCodes.push({
      code: game.shareCode,
      creatorId: game.creatorId,
      shareId: game.shareId._id || game.shareId,
    });
  }
});
```

### Criterios de Códigos Disponibles

1. ✅ Solo juegos activos del usuario
2. ✅ Solo juegos con `shareCode` (compartidos)
3. ✅ Solo juegos con `shareId` válido
4. ✅ Códigos únicos (sin duplicados)
5. ✅ Incluye información del creador

---

## 🔄 Integración con Backend

### Endpoint Utilizado

**POST** `/api/share/join`

```javascript
// Request
{
  "code": "ABC123"
}

// Response (200 OK)
{
  "success": true,
  "message": "Nuevo juego generado exitosamente",
  "data": {
    "gameSet": {
      "_id": "...",
      "userId": "...",
      "creatorId": "...",
      "shareId": "...",
      "status": "active",
      "progress": 0,
      "totalLevels": 5,
      "levels": [...]
    }
  }
}
```

### Hook Utilizado

```javascript
// useGame.js
const restartGameMutation = useMutation({
  mutationFn: async ({ shareCode }) => {
    if (!shareCode) {
      throw new Error('Este juego no tiene un código de compartición válido');
    }
    return apiService.joinGame(shareCode);
  },
  onSuccess: (response) => {
    queryClient.invalidateQueries(['levels']);
    queryClient.invalidateQueries(['progress']);
    queryClient.invalidateQueries(['prize']);
    queryClient.invalidateQueries(['activeGames']);
    queryClient.invalidateQueries(['gameStats']);
    const newGameSet = response.data.data.gameSet;
    Alert.alert('🎮 ¡Juego Reiniciado!', `Se ha creado un nuevo juego con ${newGameSet.totalLevels} niveles`);
    return newGameSet;
  },
  // ... error handling
});
```

---

## ⚠️ Manejo de Errores

### Errores Controlados

#### 1. No hay códigos disponibles

```javascript
Alert.alert(
  'No hay códigos disponibles',
  'No tienes códigos compartidos disponibles para reiniciar un juego. Únete a un juego primero en la sección "Unirse a Juego".',
  [{ text: 'Entendido' }]
);
```

#### 2. Código inactivo (Backend)

```javascript
Alert.alert(
  'Código Inactivo',
  'El código de este juego ya no está activo. Pide a tu pareja que genere uno nuevo.',
  [{ text: 'Entendido' }]
);
```

#### 3. Intentar usar propio código (Backend)

```javascript
Alert.alert(
  'Acción No Permitida',
  'No puedes reiniciar un juego creado con tus propios datos. Únete a un juego compartido por otra persona.',
  [{ text: 'Entendido' }]
);
```

#### 4. Sin shareCode en PrizeScreen

```javascript
Alert.alert(
  'No se puede reiniciar',
  'Este juego no tiene un código de compartición válido. Solo puedes reiniciar juegos compartidos por otra persona.',
  [{ text: 'Entendido', onPress: () => navigation.navigate('Home') }]
);
```

---

## 📱 Interfaz de Usuario

### Botón en Settings

- **Icono:** 🔄
- **Título:** "Reiniciar Juego"
- **Descripción:** "Genera un nuevo juego desde un código compartido"
- **Estado deshabilitado:** Cuando `restarting === true`

### Modal de Selección

- **Diseño:** Bottom sheet con animación slide
- **Fondo:** Semi-transparente (rgba(0, 0, 0, 0.5))
- **Altura máxima:** 80% de la pantalla
- **Scrollable:** Sí, si hay muchos códigos

### Tarjeta de Código

```
┌─────────────────────────────────┐
│  Nombre del Creador   [Disponible] │
│  ABC123                           │
│  Toca para generar nuevo juego    │
└─────────────────────────────────┘
```

### Loading Overlay

- **Fondo:** Semi-transparente oscuro
- **Indicador:** Circular, color #FF6B9D
- **Texto:** "Reiniciando juego..."

---

## 🧪 Casos de Prueba

### Test 1: Usuario con códigos disponibles
- **Precondición:** Usuario ha unido a juegos compartidos
- **Acción:** Presionar "Reiniciar Juego" en Settings
- **Resultado esperado:** Modal con lista de códigos
- **Estado:** ✅ Pass

### Test 2: Usuario sin códigos disponibles
- **Precondición:** Usuario sin juegos compartidos
- **Acción:** Presionar "Reiniciar Juego" en Settings
- **Resultado esperado:** Alert "No hay códigos disponibles"
- **Estado:** ✅ Pass

### Test 3: Seleccionar código y confirmar
- **Precondición:** Modal abierto con códigos
- **Acción:** Seleccionar código → Confirmar
- **Resultado esperado:** Nuevo GameSet creado, navegación a Home
- **Estado:** ✅ Pass

### Test 4: Cancelar reinicio
- **Precondición:** Modal abierto
- **Acción:** Cerrar modal o cancelar confirmación
- **Resultado esperado:** Permanecer en Settings
- **Estado:** ✅ Pass

### Test 5: Reiniciar con código ya usado
- **Precondición:** Usuario ya usó el código antes
- **Acción:** Seleccionar mismo código
- **Resultado esperado:** Nuevo GameSet creado sin error
- **Estado:** ✅ Pass

### Test 6: Reiniciar desde PrizeScreen
- **Precondición:** Juego completado con shareCode
- **Acción:** Presionar "Iniciar Nuevo Juego"
- **Resultado esperado:** Nuevo GameSet creado, navegación a Home
- **Estado:** ✅ Pass

### Test 7: PrizeScreen sin shareCode
- **Precondición:** Juego completado sin shareCode (propio)
- **Acción:** Presionar "Iniciar Nuevo Juego"
- **Resultado esperado:** Alert "No se puede reiniciar"
- **Estado:** ✅ Pass

---

## 📊 Arquitectura de Componentes

```
SettingsScreen
├── Header (Usuario, Stats)
├── Acciones
│   ├── 🔄 Reiniciar Juego ← NUEVO
│   ├── 🔗 Comparte tus retos
│   ├── 📝 Mis Datos Personales
│   ├── 🎁 Mis Premios
│   └── 🚪 Cerrar Sesión
├── Modal (Selección de Códigos) ← NUEVO
│   ├── Header (Título + Botón cerrar)
│   └── Lista de códigos
│       └── ShareCodeCard
│           ├── Nombre del creador
│           ├── Badge "Disponible"
│           ├── Código
│           └── Descripción
└── Loading Overlay ← NUEVO
    ├── ActivityIndicator
    └── Texto "Reiniciando juego..."
```

---

## 🔗 Archivos Modificados

### Mobile App

1. `/workspace/mobile/src/screens/SettingsScreen.js`
   - ✅ Añadidos imports (Modal, ActivityIndicator)
   - ✅ Añadido estado (showRestartModal, restarting, availableShareCodes)
   - ✅ Añadida función handleRestartGame()
   - ✅ Añadida función handleSelectShareCode()
   - ✅ Añadido botón "Reiniciar Juego"
   - ✅ Añadido Modal de selección
   - ✅ Añadido Loading Overlay
   - ✅ Añadidos estilos (modal, loading, cards)

### Backend (Sin cambios, solo documentación)

2. `/workspace/backend/src/controllers/share.controller.js`
   - ✅ Añadidos comentarios sobre manejo de duplicados

---

## 🎨 Diseño Visual

### Colores Utilizados

- **Primary:** #FF6B9D (Rosa)
- **Success:** #4CAF50 (Verde)
- **Background:** #FFF5F8 (Rosa claro)
- **White:** #FFFFFF
- **Dark:** #333333
- **Gray:** #666666

### Espaciado

- **Padding card:** 16px
- **Margin bottom:** 12px
- **Border radius:** 16px
- **Modal padding:** 20px

---

## 📝 Notas Importantes

### Diferencias entre Reinicio y Generación

| Aspecto | Generar Juego | Reiniciar Juego |
|---------|---------------|-----------------|
| Ubicación | Home | Settings + PrizeScreen |
| Datos usados | Propios | De otro usuario (código) |
| Requiere código | No | Sí |
| Tipo GameSet | creatorId = userId | creatorId ≠ userId |

### Limitaciones

1. ❌ No se puede reiniciar juegos propios (sin shareCode)
2. ❌ Requiere haber unido al menos un juego compartido
3. ✅ Permite reiniciar múltiples veces el mismo código

### Ventajas

1. ✅ UX intuitiva con modal de selección
2. ✅ No requiere ingresar código manualmente
3. ✅ Muestra información del creador
4. ✅ Confirmación antes de reiniciar
5. ✅ Feedback visual (loading overlay)

---

## 🔄 Relación con Otros Documentos

- Ver [JOIN_DUPLICATE_LOGIC.md](./JOIN_DUPLICATE_LOGIC.md) para detalles del manejo de duplicados
- Ver [GAME_RESTART_REFACTOR_NOTES.md](./GAME_RESTART_REFACTOR_NOTES.md) para contexto histórico
- Ver [MOBILE_HOME_RESTRUCTURE_NOTES.md](./MOBILE_HOME_RESTRUCTURE_NOTES.md) para estructura general

---

## ✅ Checklist de Implementación

- [x] Añadir botón "Reiniciar Juego" en Settings
- [x] Crear modal de selección de códigos
- [x] Implementar lógica de extracción de códigos
- [x] Añadir confirmación antes de reiniciar
- [x] Implementar loading overlay
- [x] Manejar errores (sin códigos, código inactivo, etc.)
- [x] Mantener funcionalidad en PrizeScreen
- [x] Añadir estilos responsive
- [x] Documentar cambios
- [x] Probar casos de uso

---

**Última actualización:** 2025-10-24
**Versión:** 1.0
**Estado:** ✅ Implementado y Documentado
