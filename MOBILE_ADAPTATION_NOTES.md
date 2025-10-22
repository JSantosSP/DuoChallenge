# 📱 Mobile App - Adaptación al Backend Refactorizado

## 📋 Resumen

La aplicación móvil ha sido completamente refactorizada para soportar múltiples juegos activos simultáneos, eliminando el concepto de un único juego activo y adaptándose a la nueva estructura de `GameSet` del backend.

---

## 🔄 Cambios Principales

### 1. Soporte de Múltiples Juegos Activos

**ANTES:**
- Un usuario solo podía tener un juego activo a la vez
- El progreso se gestionaba globalmente en el modelo `User`
- No había historial de juegos

**DESPUÉS:**
- Un usuario puede tener múltiples `GameSet` activos simultáneamente
- Cada `GameSet` gestiona su propio progreso independiente
- Historial completo de juegos (completados, activos, abandonados)
- Soporte para juegos propios y juegos compartidos

---

## 📂 Archivos Modificados

### API Client (`/mobile/src/api/api.js`)

**Endpoints actualizados:**

```javascript
// ANTES
generateGame: () => api.post('/api/generate'),
getLevels: () => api.get('/api/levels'),
getProgress: () => api.get('/api/progress'),

// DESPUÉS
generateGame: () => api.post('/api/game/generate'),
getLevels: (gameSetId) => api.get(`/api/game/${gameSetId}/levels`),
getProgress: (gameSetId) => api.get(`/api/game/${gameSetId}/progress`),

// NUEVOS
getGameHistory: (status) => api.get(`/api/game/history${status ? `?status=${status}` : ''}`),
getGameStats: () => api.get('/api/game/stats'),
getActiveGames: () => api.get('/api/game/active'),
getWonPrizes: () => api.get('/api/prizes/won'),
```

**Cambios en Share:**
```javascript
// ANTES
createShareCode: () => api.post('/api/share/create'),
getGameInstances: () => api.get('/api/share/instances'),

// DESPUÉS
createShareCode: () => api.post('/api/share/generate'),
getSharedGames: () => api.get('/api/share/instances'),
```

---

### Hooks (`/mobile/src/hooks/useGame.js`)

**Completamente reescrito para soportar múltiples GameSets**

#### Hook: `useGame(gameSetId)`

```javascript
// Acepta gameSetId opcional para cargar un juego específico

const { 
  levels,              // Niveles del GameSet específico
  progress,            // Progreso del GameSet específico
  activeGames,         // Lista de todos los juegos activos
  stats,               // Estadísticas globales del usuario
  verifyLevel,
  generateGame,
  getHistory,
  refetchActiveGames,
  // ...
} = useGame(gameSetId);
```

**Características clave:**
- ✅ Carga niveles de un GameSet específico usando su ID
- ✅ Obtiene lista de juegos activos del usuario
- ✅ Acceso a estadísticas globales
- ✅ Soporte para historial de juegos
- ✅ Invalidación inteligente de queries

#### Hook: `useGameShare()`

```javascript
const {
  shareCodes,          // Códigos generados por el usuario
  sharedGames,         // GameSets de juegos compartidos (donde user != creator)
  createCode,
  joinGame,
  verifyCode,
  // ...
} = useGameShare();
```

**Cambios:**
- ❌ Eliminado `instances` (era GameInstance)
- ✅ Agregado `sharedGames` (GameSets compartidos)
- ✅ Usa endpoints actualizados

#### Hook: `useWonPrizes()` ⭐ NUEVO

```javascript
const {
  wonPrizes,           // Array de premios ganados
  total,               // Total de premios ganados
  isLoading,
  refetch,
} = useWonPrizes();
```

---

## 🖼️ Pantallas Nuevas

### 1. **GameDetailScreen** ⭐ NUEVA

**Ubicación:** `/mobile/src/screens/GameDetailScreen.js`

**Propósito:** Mostrar niveles y progreso de un GameSet específico

**Características:**
- Muestra todos los niveles del GameSet
- Barra de progreso específica del juego
- Indicador de tipo de juego (propio vs compartido)
- Niveles bloqueados hasta completar el anterior
- Badge si el juego está completado
- Botón para ver premio si está disponible

**Navegación:**
```javascript
navigation.navigate('GameDetail', { gameSet })
```

**Props requeridas:**
```javascript
route.params = {
  gameSet: {
    _id: string,
    status: 'active' | 'completed' | 'abandoned',
    progress: number,
    totalLevels: number,
    completedLevels: array,
    shareCode: string | null,
    prizeId: string | null,
    // ...
  }
}
```

### 2. **WonPrizesScreen** ⭐ NUEVA

**Ubicación:** `/mobile/src/screens/WonPrizesScreen.js`

**Propósito:** Mostrar todos los premios ganados por el usuario

**Características:**
- Lista completa de premios ganados
- Tarjetas con imagen, título, descripción
- Badge de "Canjeado" para premios usados
- Indicador de peso del premio (pequeño/mediano/grande)
- Fecha de obtención y fecha de canje
- Estadísticas: Total, Canjeados, Disponibles
- Estado vacío si no hay premios ganados

**Navegación:**
```javascript
navigation.navigate('WonPrizes')
```

**Datos mostrados:**
```javascript
{
  prizeId: string,
  title: string,
  description: string,
  imagePath: string,
  weight: number,
  completedAt: Date,
  gameSetId: string,
  used: boolean,
  usedAt: Date | null,
}
```

### 3. **GameHistoryScreen** ⭐ NUEVA

**Ubicación:** `/mobile/src/screens/GameHistoryScreen.js`

**Propósito:** Mostrar historial completo de juegos del usuario

**Características:**
- Filtros: Todos, Completados, Activos, Abandonados
- Cards con información de cada GameSet:
  - Tipo (propio vs compartido)
  - Estado (activo/completado/abandonado)
  - Progreso porcentual
  - Niveles completados
  - Fechas de inicio y fin
  - Indicador de premio ganado
- Clic en juego activo navega a GameDetail
- Refresh para actualizar

**Navegación:**
```javascript
navigation.navigate('GameHistory')
```

**Filtros disponibles:**
```javascript
'all'        // Todos los juegos
'completed'  // Solo completados
'active'     // Solo activos
'abandoned'  // Solo abandonados
```

---

## 🔄 Pantallas Modificadas

### 1. **HomeScreen**

**ANTES:**
- Mostraba niveles del juego activo directamente
- Un solo juego a la vez

**DESPUÉS:**
- Muestra lista de todos los juegos activos
- Cards clickeables que navegan a GameDetail
- Estadísticas globales (completados, premios, activos)
- Botones de acción:
  - Ver Premios Ganados
  - Ver Historial
  - Unirse a un Juego
  - Generar Mi Juego
- Estado vacío con opciones de inicio

**Cambios técnicos:**
```javascript
// ANTES
const { levels, progress } = useGame();

// DESPUÉS
const { activeGames, stats } = useGame();
```

### 2. **LevelScreen**

**ANTES:**
- No recibía gameSetId

**DESPUÉS:**
- Recibe `gameSetId` de la navegación
- Muestra información del nivel específico
- Tipo de nivel (texto, fecha, foto/puzzle)
- Intentos restantes
- Pistas disponibles
- Estado de completitud

**Cambios en navegación:**
```javascript
// ANTES
navigation.navigate('Level', { level })

// DESPUÉS
navigation.navigate('Level', { level, gameSetId })
```

### 3. **ChallengeScreen**

**ESTADO:** ✅ Mantenida (aún es necesaria)

Aunque se eliminó el concepto de "Challenge" a nivel de backend, esta pantalla sigue siendo necesaria porque:
- Representa la UI para responder un nivel
- Renderiza diferentes tipos de input según el tipo de dato
- Gestiona la verificación de respuestas
- Muestra pistas progresivas

**Nota:** El nombre "Challenge" es solo de UI, internamente trabaja con `Level`

### 4. **ShareScreen**

**Cambios:**
```javascript
// ANTES
const { gameInstances } = useShare();

// DESPUÉS
const { sharedGames } = useGameShare();
```

- Ahora muestra `GameSets` compartidos en lugar de `GameInstances`
- Cada shared game incluye progreso y estado
- Compatible con múltiples juegos compartidos

### 5. **PrizeScreen**

**Cambio menor:**
```javascript
// DESPUÉS
route.params = {
  gameSetId: string  // ID del GameSet que contiene el premio
}
```

Ahora puede recibir el gameSetId para obtener el premio específico de ese juego.

---

## 🗑️ Componentes sin Cambios

### 1. **ChallengeInput** ✅ Mantenido

- Renderiza inputs según tipo de dato (texto, fecha, puzzle)
- Sigue siendo útil y funcional
- Sin cambios necesarios

### 2. **Otros Componentes UI**

- **AppButton** - Sin cambios
- **ProgressBar** - Sin cambios
- **PuzzleGame** - Sin cambios
- **LoadingOverlay** - Sin cambios

---

## 🧭 Navegación Actualizada

### Rutas Nuevas

```javascript
<Stack.Screen name="GameDetail" component={GameDetailScreen} />
<Stack.Screen name="WonPrizes" component={WonPrizesScreen} />
<Stack.Screen name="GameHistory" component={GameHistoryScreen} />
```

### Flujo de Navegación

```
HomeScreen
  ├─> GameDetail (click en juego activo)
  │   └─> Level (click en nivel)
  │       └─> Challenge (jugar nivel)
  │           └─> [verificar] → volver a Level
  ├─> WonPrizes (ver premios ganados)
  ├─> GameHistory (ver historial)
  │   └─> GameDetail (click en juego activo)
  ├─> JoinGame (unirse con código)
  │   └─> [éxito] → Home (con nuevo juego activo)
  └─> Settings
      ├─> MyData
      ├─> MyPrizes
      └─> Share
```

---

## 🎨 Diseño y UX

### Paleta de Colores (mantenida)

```javascript
// Colores principales
const colors = {
  primary: '#FF6B9D',      // Rosa principal
  secondary: '#4ECDC4',    // Turquesa
  success: '#4CAF50',      // Verde
  warning: '#FF9800',      // Naranja
  error: '#F44336',        // Rojo
  background: '#FFF5F8',   // Rosa muy claro
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textLighter: '#999999',
  border: '#E0E0E0',
};
```

### Iconos por Tipo

```javascript
// Tipos de juego
'🎮' - Juego propio
'🔗' - Juego compartido

// Estados de nivel
'🎯' - Nivel disponible
'✅' - Nivel completado
'🔒' - Nivel bloqueado

// Tipos de dato
'✏️' - Texto
'📅' - Fecha
'🖼️' - Puzzle/Foto
'📍' - Lugar

// Estados de juego
'⏳' - Activo
'✓' - Completado
'✕' - Abandonado

// Acciones
'🏆' - Premios
'📊' - Estadísticas/Historial
'⚙️' - Configuración
```

---

## 🔄 Flujos de Usuario Actualizados

### Flujo 1: Generar Juego Propio

1. User en **Home** → clic "Generar Mi Juego"
2. `generateGame()` crea nuevo GameSet
3. Home se actualiza mostrando nuevo juego en lista
4. User clic en juego → **GameDetail**
5. User clic en nivel → **Level** → **Challenge**
6. Completar niveles progresivamente
7. Al completar todos → **Premio**

### Flujo 2: Unirse a Juego Compartido

1. User en **Home** → clic "Unirse a un Juego"
2. **JoinGame** → ingresar código
3. `joinGame(code)` crea GameSet compartido
4. Navegar a **Home** (actualizado con nuevo juego)
5. Clic en juego compartido → **GameDetail**
6. Jugar igual que juego propio

### Flujo 3: Ver Múltiples Juegos Activos

1. User en **Home** ve lista de juegos activos
2. Cada card muestra:
   - Tipo (propio/compartido)
   - Progreso %
   - Niveles completados
3. Clic en cualquier juego → **GameDetail**
4. Cambiar entre juegos libremente

### Flujo 4: Ver Historial y Premios

1. User en **Home** → clic "Ver Historial"
2. **GameHistory** con filtros
3. Ver juegos completados, activos, abandonados
4. Clic en juego activo → **GameDetail**
5. Volver a Home → clic "Ver Premios Ganados"
6. **WonPrizes** muestra todos los premios
7. Premios canjeados marcados

---

## ⚡ Optimizaciones

### 1. Query Invalidation

```javascript
// Invalidación inteligente después de acciones
onSuccess: (data) => {
  queryClient.invalidateQueries(['levels', gameSetId]);
  queryClient.invalidateQueries(['progress', gameSetId]);
  queryClient.invalidateQueries(['activeGames']);
  queryClient.invalidateQueries(['gameStats']);
}
```

### 2. Refetch Strategies

```javascript
// Refetch automático al volver a pantalla
useEffect(() => {
  if (isFocused) {
    refetchLevels();
    refetchProgress();
  }
}, [isFocused]);
```

### 3. Loading States

```javascript
// Loading optimizado
if (levelsLoading && !refreshing) {
  return <LoadingOverlay message="Cargando niveles..." />;
}
```

---

## 🚀 Futuras Mejoras Sugeridas

### 1. Notificaciones Push

```javascript
// Notificar cuando:
- Alguien usa tu código compartido
- Se completa un juego
- Se gana un premio
- Nuevo contenido disponible
```

### 2. Rankings y Competitividad

```javascript
// Agregar:
- Tabla de clasificación por tiempo
- Comparar con amigos
- Achievements/Logros
- Badges por hitos
```

### 3. Modo Offline

```javascript
// Permitir:
- Jugar niveles ya cargados sin conexión
- Sincronizar progreso al reconectar
- Cache de imágenes de puzzles
```

### 4. Compartir en Redes

```javascript
// Integración con:
- WhatsApp (compartir código)
- Instagram Stories (logros)
- Facebook (invitaciones)
```

### 5. Personalización

```javascript
// Opciones de:
- Temas (claro/oscuro)
- Idiomas (i18n)
- Sonidos y efectos
- Avatares de usuario
```

---

## 📋 Checklist de Verificación

### ✅ API y Hooks

- [x] API client actualizado con nuevos endpoints
- [x] Hook `useGame` reescrito para múltiples GameSets
- [x] Hook `useGameShare` actualizado
- [x] Hook `useWonPrizes` creado
- [x] Todos los endpoints usan gameSetId correctamente

### ✅ Pantallas

- [x] HomeScreen actualizado para lista de juegos
- [x] GameDetailScreen creada
- [x] WonPrizesScreen creada
- [x] GameHistoryScreen creada
- [x] LevelScreen actualizado con gameSetId
- [x] ChallengeScreen funcional (sin cambios)
- [x] ShareScreen usa nuevos hooks

### ✅ Navegación

- [x] Rutas nuevas agregadas
- [x] Flujos de navegación actualizados
- [x] Parámetros correctos en navigation.navigate

### ✅ UX y Diseño

- [x] Paleta de colores consistente
- [x] Iconos informativos
- [x] Estados vacíos con CTAs
- [x] Loading states apropiados
- [x] Feedback visual en acciones

---

## 🧪 Testing Recomendado

### Tests Unitarios

```javascript
describe('useGame hook', () => {
  it('should load levels for specific gameSetId', async () => {
    const { result } = renderHook(() => useGame('gameSetId123'));
    await waitFor(() => expect(result.current.levels).toBeDefined());
  });
  
  it('should load multiple active games', async () => {
    const { result } = renderHook(() => useGame());
    await waitFor(() => expect(result.current.activeGames).toHaveLength(2));
  });
});
```

### Tests E2E

1. ✅ Login → Ver juegos activos
2. ✅ Generar nuevo juego → Aparece en lista
3. ✅ Clic en juego → Ver niveles
4. ✅ Jugar nivel → Verificar respuesta
5. ✅ Completar juego → Ver premio
6. ✅ Ver historial → Filtrar por estado
7. ✅ Ver premios ganados → Lista completa
8. ✅ Unirse con código → Crear GameSet compartido

---

## 📚 Documentación Relacionada

- [GAMESET_REFACTOR_NOTES.md](./GAMESET_REFACTOR_NOTES.md) - Cambios en backend
- [USER_WON_PRIZES_NOTES.md](./USER_WON_PRIZES_NOTES.md) - Endpoint de premios ganados
- [BACKOFFICE_ADAPTATION_NOTES.md](./BACKOFFICE_ADAPTATION_NOTES.md) - Cambios en backoffice
- [FRONTEND_API_SYNC_NOTES.md](./FRONTEND_API_SYNC_NOTES.md) - Sincronización completa

---

**Fecha de actualización:** 2025-10-22  
**Versión:** 2.0.0  
**Estado:** ✅ Completado y funcional
