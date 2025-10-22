# Análisis de Arquitectura del Sistema de Juego

**Documento técnico:** Análisis de la lógica de GameInstance, GameSet, Level y GameShare  
**Fecha de análisis:** 2025-10-22  
**Objetivo:** Evaluar la arquitectura actual y proponer mejoras para escalabilidad y consistencia

---

## 🧩 A. Mapa de Relaciones entre Modelos

### Diagrama de Relaciones (ORM)

```
User
├── currentSetId → GameSet (referencia directa al set activo)
├── completedLevels → [Level] (array de niveles completados)
├── currentPrizeId → [Prize] (array de premios actuales - inconsistencia: debería ser objeto único)
├── totalSetsCompleted (contador)
└── activeGameInstances → [GameInstance] (array de instancias activas)

GameShare
├── creatorId → User (quien genera el código)
├── code (String, único)
├── active (Boolean)
├── usedBy → [{ userId: User, joinedAt: Date }] (array de usuarios que usaron el código)
├── maxUses (límite de usos)
└── expiresAt (fecha de expiración)

GameInstance
├── playerId → User (quien juega)
├── creatorId → User (creador del código)
├── shareCode (String, código usado)
├── currentSetId → GameSet (set de juego activo de esta instancia)
├── completedSets (contador)
├── active (Boolean)
├── completedLevels → [Level] (REDUNDANCIA con User y GameSet)
└── currentPrizeId → Prize (REDUNDANCIA con User)

GameSet
├── userId → User (jugador del set - puede ser diferente del creatorId)
├── gameInstanceId → GameInstance (opcional, puede ser null)
├── levels → [Level] (array de niveles del set)
├── seed (String, para generación determinística)
├── prizeId → Prize (premio asignado al completar)
├── completed (Boolean)
├── completedAt (Date)
└── active (Boolean)

Level
├── gameSetId → GameSet (set al que pertenece)
├── categoryId → Category (categoría del nivel)
├── tipoDato → Variable (tipo de dato: texto, fecha, lugar, foto)
├── difficulty (enum: easy, medium, hard)
├── order (número de orden en el set)
├── currentAttempts (contador de intentos)
├── maxAttempts (límite de intentos)
├── completed (Boolean)
├── completedAt (Date)
├── valor (Object con hash de respuesta por tipo)
├── pregunta (String)
├── pistas → [String] (array de pistas)
└── puzzleGrid (número para rompecabezas de foto)
```

### Campos Principales por Modelo

| Modelo | Campos Clave | Tipo de Relación |
|--------|-------------|------------------|
| **User** | `currentSetId`, `completedLevels`, `activeGameInstances`, `totalSetsCompleted` | 1:1 con GameSet activo, 1:N con GameInstance |
| **GameShare** | `creatorId`, `code`, `usedBy[]` | N:1 con User (creador), N:N con Users (jugadores) |
| **GameInstance** | `playerId`, `creatorId`, `shareCode`, `currentSetId` | N:1 con User (jugador), N:1 con User (creador), 1:1 con GameSet activo |
| **GameSet** | `userId`, `gameInstanceId`, `levels[]`, `seed`, `prizeId` | N:1 con User, N:1 con GameInstance (opcional), 1:N con Level |
| **Level** | `gameSetId`, `tipoDato`, `categoryId`, `completed`, `currentAttempts` | N:1 con GameSet, N:1 con Variable, N:1 con Category |

### Redundancias Detectadas

1. **`completedLevels`**: Existe en **User** Y en **GameInstance**
   - Problema: Duplicación de datos, inconsistencia potencial
   - El campo debería vivir solo en GameSet/Level con flag `completed`

2. **`currentPrizeId`**: Existe en **User** (como array) Y en **GameInstance** (como ObjectId único)
   - Problema: Inconsistencia de tipo (array vs single value)
   - En User debería ser un array de Prizes ganados, en GameInstance/GameSet un premio específico

3. **`currentSetId`**: Existe en **User** Y en **GameInstance**
   - Problema: El modelo actual solo soporta UN juego activo por usuario globalmente
   - Si un usuario tiene múltiples GameInstance, ¿cuál es el "current"?

4. **`userId` en GameSet**: Puede ser diferente del jugador real si viene de un GameInstance
   - Confusión: ¿Es el jugador o el creador de los datos?
   - Actualmente el flujo usa `creatorId` para generar niveles, pero `targetUserId` (playerId) para asignarlos

---

## ⚙️ B. Flujo Actual del Juego (Endpoints y Lógica)

### 1. Crear un GameShare (Código compartible)

**Endpoint:** `POST /api/share/create`  
**Controller:** `share.controller.js → createShareCode()`

**Flujo:**
1. Usuario autenticado crea un código de 6 caracteres único
2. Se verifica que tenga `UserData` activo (datos personalizados)
3. Se desactivan códigos anteriores del usuario (`active: false`)
4. Se genera un código único alfanumérico
5. Se crea un `GameShare` con:
   ```javascript
   {
     creatorId: req.user._id,
     code: "ABC123",
     active: true
   }
   ```

**Problemas detectados:**
- No se valida si el usuario tiene **premios** (Prize) disponibles
- El frontend `useShareValidation` sí valida premios, pero el backend no

---

### 2. Unirse a un juego compartido (Join Game)

**Endpoint:** `POST /api/share/join`  
**Controller:** `share.controller.js → joinGame()`

**Flujo:**
1. Usuario autenticado envía un `code`
2. Se busca el `GameShare` con ese código (`active: true`)
3. Se valida:
   - Código existe y está activo
   - No es el creador del código
   - No ha expirado (`expiresAt`)
   - No ha alcanzado máximo de usos (`maxUses`)
4. Se busca si ya existe un `GameInstance` para ese jugador+creador+código
5. **Si no existe:**
   - Se crea un `GameInstance`:
     ```javascript
     {
       playerId: req.user._id,
       creatorId: gameShare.creatorId,
       shareCode: code,
       active: true
     }
     ```
   - Se añade a `gameShare.usedBy[]` (si no había usado antes)
   - Se añade a `user.activeGameInstances[]`
6. **Si no tiene `currentSetId`:**
   - Se genera el primer `GameSet` llamando a `generateNewGameSet(creatorId, gameInstanceId)`

**Resultado:** Se retorna la `gameInstance` creada o encontrada

---

### 3. Generar un GameSet (Set de niveles)

**Función:** `gameset.service.js → generateNewGameSet(creatorId, gameInstanceId = null)`

**Flujo:**
1. Genera un `seed` único para generación determinística
2. Determina el `targetUserId`:
   - Si hay `gameInstanceId`: usa el `playerId` de la instancia
   - Si no: usa directamente `creatorId`
3. Desactiva el `GameSet` anterior (`active: false`)
4. Crea un nuevo `GameSet`:
   ```javascript
   {
     userId: targetUserId,
     gameInstanceId: gameInstanceId || null,
     levels: [],
     seed: seed,
     completed: false,
     active: true
   }
   ```
5. Genera niveles usando `generateLevels(creatorId, gameSet._id, seed, nlevels)`
   - **Importante:** Usa los `UserData` del **creador**, no del jugador
   - Genera entre 0-5 niveles (random seeded)
6. Actualiza `gameSet.levels[]` con los IDs de los niveles creados
7. Actualiza `GameInstance.currentSetId` o `User.currentSetId` según corresponda
8. Resetea `completedLevels`, `completedChallenges`, `currentPrizeId` a vacío

**Problemas detectados:**
- `completedChallenges` se menciona pero no existe en el modelo actual
- La cantidad de niveles es aleatoria (0-5), puede generar sets vacíos

---

### 4. Completar un nivel (Verify Level)

**Endpoint:** `POST /api/level/:levelId/verify` (frontend)  
**Problema crítico:** ⚠️ **Este endpoint NO EXISTE en el backend**

**Endpoint real del backend:** No hay ruta específica para verificar niveles individuales  
**Lo que existe:** `game.controller.js → verifyLevel()` (función definida pero no expuesta)

**Flujo esperado (según el código del controller):**
1. Se recibe `levelId` y `answer` o `puzzleOrder`
2. Se busca el `Level` y se valida:
   - Existe
   - No está completado
   - No ha superado `maxAttempts`
3. Se incrementa `currentAttempts`
4. Se verifica la respuesta según el tipo (`tipoDato`):
   - **texto:** `verifyAnswer()` - comparación normalizada
   - **fecha:** `verifyDateAnswer()` - normalización YYYY-MM-DD
   - **lugar:** `verifyAnswer()` - similar a texto
   - **foto:** `verifyPuzzleAnswer()` - orden del puzzle
5. **Si es correcta:**
   - Se marca `level.completed = true`
   - Se añade a `user.completedLevels[]`
   - Se llama a `checkGameSetCompletion(userId)`
6. **Si el set está completo:**
   - Se marca `gameSet.completed = true`
   - Se asigna premio con `assignPrize(userId, gameSet.seed)`
   - Se incrementa `user.totalSetsCompleted`

**Inconsistencia crítica:**
- El mobile llama a `/api/level/:levelId/verify`
- El backend no tiene esta ruta registrada
- El sistema actual probablemente está roto para verificar respuestas

---

### 5. Verificar completitud del set

**Función:** `gameset.service.js → checkGameSetCompletion(userId)`

**Flujo:**
1. Obtiene `user.currentSetId`
2. Busca el `GameSet` y hace populate de `levels`
3. Verifica si **todos** los niveles tienen `level.completed === true`
4. Si todos están completos y `gameSet.completed === false`:
   - Marca `gameSet.completed = true`
   - Asigna premio: `assignPrize(userId, gameSet.seed)`
   - Actualiza `gameSet.prizeId`
   - Incrementa `user.totalSetsCompleted`
5. Retorna `{ completed: true/false, prize }`

**Problema:**
- Solo funciona con `user.currentSetId`, no con GameInstance
- No hay forma de verificar completitud de múltiples instancias activas

---

### 6. Asignar premio

**Función:** `prize.service.js → assignPrize(userId, seed)`

**Flujo:**
1. Busca `Prize` donde:
   ```javascript
   { userId: userId, active: true, used: false }
   ```
2. Selecciona uno basado en peso (`selectPrizeByWeight()`)
3. Marca el premio como usado:
   ```javascript
   {
     used: true,
     usedBy: userId,
     usedAt: new Date()
   }
   ```
4. Añade a `user.currentPrizeId[]` (usando `$push`)

**Problema:**
- Solo busca premios del propio usuario
- No hay premios "del sistema" como sugiere el comentario del código

---

### 7. Obtener progreso

**Endpoint:** `GET /api/progress`  
**Controller:** `game.controller.js → getProgress()`

**Flujo:**
1. Obtiene el usuario con populate de `currentSetId` y `currentPrizeId`
2. Si no tiene `currentSetId`: retorna `{ hasActiveGame: false, progress: 0 }`
3. Si tiene:
   - Cuenta total de niveles del set
   - Cuenta `user.completedLevels.length`
   - Calcula porcentaje de progreso
4. Retorna:
   ```javascript
   {
     hasActiveGame: true,
     progress: 75,
     completedLevels: 3,
     totalSetsCompleted: 5,
     currentPrize: {...}
   }
   ```

**Problema:**
- Solo muestra el set activo (`currentSetId`)
- No hay visibilidad del historial de `GameInstance`
- No se puede consultar progreso de múltiples juegos activos

---

### 8. Reiniciar juego

**Endpoint:** `POST /api/reset`  
**Controller:** `game.controller.js → resetGame()`  
**Service:** `gameset.service.js → resetAndGenerateNewSet()`

**Flujo:**
1. Desactiva todos los `GameSet` del usuario (`active: false`)
2. Busca todos los sets antiguos y obtiene sus `levels[]`
3. **ELIMINA todos los niveles antiguos** (`deleteMany`)
4. Genera un nuevo set con `generateNewGameSet(userId)`

**Problema:**
- Elimina el historial de niveles completados
- No hay forma de revisar juegos anteriores
- No contempla `GameInstance`, solo el usuario directo

---

## 🧮 C. Evaluación de la Estructura Actual

### Análisis Crítico de Modelos

| Modelo | Rol Actual | Problemas Detectados | Posible Mejora |
|--------|-----------|---------------------|----------------|
| **GameInstance** | Representa una partida activa de un jugador usando un código de otro | Redundante con GameSet, relación casi 1:1, duplica campos como `completedLevels` y `currentPrizeId` | Fusionarlo con GameSet o convertirlo en un registro histórico sin datos duplicados |
| **GameSet** | Colección de niveles de un juego | Tiene `userId` y `gameInstanceId`, pero no queda claro quién es el "dueño", mezcla jugador y creador | Separar claramente: `playerId` (quien juega) y `creatorId` (de quién son los datos) |
| **Level** | Nivel individual con pregunta, respuesta, intentos | Funciona bien, pero `completed` y `completedAt` podrían estar en una tabla intermedia | Mantener, agregar tracking de intentos históricos |
| **GameShare** | Código compartible con metadata | Funciona bien, pero `usedBy[]` crece infinitamente | Mantener, considerar limpiar códigos antiguos o limitar historial |
| **User** | Usuario con referencias al juego activo | `currentSetId`, `completedLevels[]`, `activeGameInstances[]` mezclan responsabilidades | Mover `currentSetId` y `completedLevels` al contexto de GameInstance/GameSet |

### Problemas de Escalabilidad

#### 1. **Limitación de un solo juego activo por usuario**
**Problema:**
- `User.currentSetId` solo puede apuntar a UN `GameSet`
- Si un usuario tiene múltiples `GameInstance` activas (varios códigos de diferentes amigos), ¿cuál es el "current"?
- No hay forma de cambiar entre juegos activos

**Evidencia:**
```javascript
// share.controller.js línea 66-72
await User.findByIdAndUpdate(targetUserId, {
  currentSetId: gameSet._id,
  completedChallenges: [],
  completedLevels: [],
  currentPrizeId: null
});
```
Cada vez que se genera un set, se sobreescribe el anterior.

#### 2. **Duplicación de datos de progreso**
**Problema:**
- `completedLevels` existe en `User` y en `GameInstance`
- Al completar un nivel, se actualiza `User.completedLevels` pero no `GameInstance.completedLevels`
- No hay sincronización entre ambos

**Evidencia:**
```javascript
// game.controller.js línea 195-197
await User.findByIdAndUpdate(userId, {
  $addToSet: { completedLevels: level._id }
});
```
Solo actualiza User, no GameInstance.

#### 3. **Inconsistencia en tipo de datos**
**Problema:**
- `User.currentPrizeId` es un **array** (`[{ type: ObjectId, ref: 'Prize' }]`)
- `GameInstance.currentPrizeId` es un **ObjectId único**
- El código hace `$push` en User pero espera un único valor en GameInstance

**Evidencia:**
```javascript
// User.model.js línea 35-38
currentPrizeId: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Prize'
}],

// GameInstance.model.js línea 35-39
currentPrizeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Prize',
  default: null
}
```

#### 4. **Falta de historial de partidas**
**Problema:**
- No hay forma de ver juegos completados anteriormente
- `resetGame()` elimina físicamente los niveles antiguos
- `GameInstance` tiene `completedSets` (contador) pero no guarda referencias a los sets completados

**Consecuencia:**
- Un usuario no puede revisar sus respuestas pasadas
- No hay estadísticas históricas
- No se puede repetir un nivel

#### 5. **Endpoints inconsistentes entre frontend y backend**
**Problema crítico:**
- Mobile llama a `/api/level/:levelId/verify` (línea 57-58 de api.js)
- Backend NO tiene esta ruta registrada en `game.routes.js`
- La función `verifyLevel` existe en el controller pero no está expuesta

**Impacto:**
- El sistema actual probablemente no puede verificar respuestas
- El juego está funcionalmente roto

### Ventajas de la Estructura Actual

| Aspecto | Ventaja |
|---------|---------|
| **Seed determinístico** | Permite regenerar el mismo set de preguntas usando el mismo seed |
| **Separación de creador y jugador** | GameShare permite que un usuario juegue con datos de otro |
| **Sistema de premios con pesos** | Selección probabilística de premios basada en peso |
| **Verificación segura de respuestas** | Uso de hashes + salt para no exponer respuestas al cliente |
| **Soporte para múltiples tipos de retos** | texto, fecha, lugar, foto (puzzle) |
| **Sistema de intentos y pistas** | Mecánica de juego con límite de intentos y revelación progresiva de pistas |

---

## 🔄 D. Escalabilidad Propuesta

### Objetivo de Mejoras
Permitir que un usuario:
1. Tenga múltiples juegos activos simultáneamente (diferentes códigos)
2. Pueda cambiar entre juegos sin perder progreso
3. Vea historial de juegos completados
4. Repita niveles o revise respuestas anteriores
5. Tenga estadísticas agregadas (total de niveles completados, tasa de éxito, etc.)

---

### Opción A: Mantener GameInstance como Entidad Central

**Concepto:**
- `GameInstance` se convierte en el contenedor principal de una partida
- Mueve toda la lógica de progreso desde `User` a `GameInstance`
- `User` solo mantiene estadísticas agregadas

#### Estructura propuesta

```javascript
// GameInstance (ampliado)
{
  playerId: ObjectId → User,
  creatorId: ObjectId → User,
  shareCode: String,
  
  // Sets de este juego
  sets: [{
    setId: ObjectId → GameSet,
    startedAt: Date,
    completedAt: Date,
    status: 'active' | 'completed' | 'abandoned'
  }],
  
  // Set actual
  currentSetId: ObjectId → GameSet,
  
  // Progreso global de esta instancia
  totalLevelsCompleted: Number,
  totalSetsCompleted: Number,
  
  // Premios ganados en esta instancia
  prizes: [ObjectId → Prize],
  
  // Metadata
  active: Boolean,
  lastPlayedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// User (simplificado)
{
  name, email, passwordHash, role,
  
  // Referencia a instancia activa actual (puede cambiar)
  activeGameInstanceId: ObjectId → GameInstance,
  
  // Estadísticas globales
  stats: {
    totalGamesPlayed: Number,
    totalLevelsCompleted: Number,
    totalPrizesWon: Number
  }
}

// GameSet (sin cambios mayores)
{
  gameInstanceId: ObjectId → GameInstance, // OBLIGATORIO
  levels: [ObjectId → Level],
  seed: String,
  prizeId: ObjectId → Prize,
  completed: Boolean,
  completedAt: Date,
  progress: {
    total: Number,
    completed: Number,
    percentage: Number
  }
}

// Level (sin cambios)
{
  gameSetId: ObjectId → GameSet,
  // ... resto de campos actuales
  
  // Nuevo: historial de intentos
  attempts: [{
    answer: String, // ofuscado o hash
    isCorrect: Boolean,
    attemptedAt: Date
  }]
}
```

#### Endpoints nuevos necesarios

```
# GameInstance Management
GET    /api/game/instances              # Listar todas las instancias del usuario
GET    /api/game/instances/:id          # Obtener una instancia específica
POST   /api/game/instances/:id/activate # Cambiar a esta instancia como activa
GET    /api/game/instances/:id/progress # Progreso de esta instancia
POST   /api/game/instances/:id/sets     # Generar nuevo set en esta instancia

# Level Management (CORREGIR)
GET    /api/game/levels                 # Niveles del set activo de la instancia activa
GET    /api/game/levels/:id             # Obtener un nivel específico
POST   /api/game/levels/:id/verify      # Verificar respuesta ⚠️ FALTA IMPLEMENTAR RUTA
GET    /api/game/levels/:id/attempts    # Historial de intentos

# Historical
GET    /api/game/history                # Historial de juegos completados
GET    /api/game/stats                  # Estadísticas agregadas
```

#### Pros y Contras

| Pros | Contras |
|------|---------|
| ✅ Mantiene la lógica actual de GameInstance | ❌ GameInstance duplica funcionalidad de GameSet |
| ✅ Fácil de migrar desde la estructura actual | ❌ Dos niveles de jerarquía (Instance → Set → Level) puede ser confuso |
| ✅ Clara separación de "partidas" por código | ❌ Requiere mantener sincronización entre Instance y Set |
| ✅ Historial por instancia es natural | |

---

### Opción B: Eliminar GameInstance y Delegar a GameSet

**Concepto:**
- `GameSet` se convierte en la entidad principal de una partida
- Incluye toda la información de `GameInstance`
- Simplifica la jerarquía a: User → GameSet → Level

#### Estructura propuesta

```javascript
// GameSet (expandido con info de GameInstance)
{
  // Identificación
  playerId: ObjectId → User,
  creatorId: ObjectId → User,
  shareCode: String, // código usado para crear este juego
  
  // Datos del juego
  levels: [ObjectId → Level],
  seed: String,
  
  // Progreso
  completed: Boolean,
  completedAt: Date,
  prizeId: ObjectId → Prize,
  
  // Status
  status: 'active' | 'completed' | 'abandoned',
  active: Boolean, // para filtrar activos rápidamente
  lastPlayedAt: Date,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}

// User (simplificado)
{
  name, email, passwordHash, role,
  
  // Juego activo actual
  activeGameSetId: ObjectId → GameSet,
  
  // Estadísticas
  stats: {
    totalGamesPlayed: Number,
    totalLevelsCompleted: Number,
    totalPrizesWon: Number
  }
}

// GameShare (sin cambios)
{
  creatorId: ObjectId → User,
  code: String,
  active: Boolean,
  usedBy: [{ userId, joinedAt }],
  // ...
}

// Level (con historial de intentos)
{
  gameSetId: ObjectId → GameSet,
  // ... campos actuales
  
  attempts: [{
    answer: String,
    isCorrect: Boolean,
    attemptedAt: Date
  }]
}
```

#### Cambios en los servicios

```javascript
// share.controller.js → joinGame()
const joinGame = async (req, res) => {
  const playerId = req.user._id;
  const { code } = req.body;
  
  const gameShare = await GameShare.findOne({ code, active: true });
  // ... validaciones
  
  // Buscar si ya existe un GameSet para este jugador+código
  let gameSet = await GameSet.findOne({
    playerId,
    creatorId: gameShare.creatorId,
    shareCode: code,
    status: { $in: ['active', 'completed'] }
  });
  
  if (!gameSet) {
    // Crear nuevo GameSet directamente
    gameSet = await generateNewGameSet({
      playerId,
      creatorId: gameShare.creatorId,
      shareCode: code
    });
    
    // Registrar uso del código
    gameShare.usedBy.push({ userId: playerId, joinedAt: new Date() });
    await gameShare.save();
  }
  
  // Activar este GameSet
  await User.findByIdAndUpdate(playerId, {
    activeGameSetId: gameSet._id
  });
  
  res.json({ success: true, data: { gameSet } });
};
```

#### Endpoints

```
# GameSet Management
GET    /api/game/sets                   # Todos los sets del usuario (activos, completados, etc.)
GET    /api/game/sets/:id               # Set específico
POST   /api/game/sets/:id/activate      # Cambiar a este set como activo
GET    /api/game/sets/:id/progress      # Progreso del set

# Level Management
GET    /api/game/levels                 # Niveles del set activo
GET    /api/game/levels/:id             # Nivel específico
POST   /api/game/levels/:id/verify      # Verificar respuesta ⚠️ IMPLEMENTAR
GET    /api/game/levels/:id/attempts    # Historial de intentos

# Share (sin cambios mayores)
POST   /api/share/create
POST   /api/share/join                  # Ahora crea/busca GameSet directamente
GET    /api/share/codes
GET    /api/share/instances             # RENOMBRAR a /api/share/games o /api/share/sets
```

#### Pros y Contras

| Pros | Contras |
|------|---------|
| ✅ Simplifica la jerarquía (User → GameSet → Level) | ❌ Requiere migración de datos de GameInstance a GameSet |
| ✅ Elimina redundancia entre Instance y Set | ❌ Cambia significativamente la arquitectura |
| ✅ Más fácil de entender: un "juego" = un GameSet | ❌ Requiere actualizar todos los servicios y controladores |
| ✅ Reduce duplicación de datos | ❌ Impacto mayor en frontend (cambio de nombres) |
| ✅ Menos joins en consultas | |

---

### Recomendación: Opción B (Eliminar GameInstance)

**Razones:**
1. **GameInstance no aporta valor funcional único**: Todo lo que hace puede hacerlo GameSet
2. **Simplicidad arquitectónica**: Menos modelos = menos complejidad
3. **Eliminación de redundancias**: No más `completedLevels` duplicado, no más `currentPrizeId` inconsistente
4. **Escalabilidad**: Un usuario puede tener N GameSets (cada uno de un código diferente) y cambiar entre ellos
5. **Historial natural**: `GameSet.status` y `completed` permiten filtrar activos/completados fácilmente

**Plan de migración:**
1. Añadir campos de GameInstance a GameSet (`playerId`, `creatorId`, `shareCode`, `status`)
2. Migrar datos de GameInstance existentes a GameSet
3. Actualizar servicios para usar GameSet directamente
4. Actualizar controladores y rutas
5. Deprecar y eliminar GameInstance
6. Actualizar frontend

---

### Diagrama de Relaciones Simplificado (Opción B)

```
User
├── activeGameSetId → GameSet (juego activo actual)
└── stats: { totalGamesPlayed, totalLevelsCompleted, totalPrizesWon }

GameShare
├── creatorId → User
├── code (String único)
└── usedBy: [{ userId → User, joinedAt }]

GameSet (reemplaza a GameInstance + GameSet actual)
├── playerId → User (quien juega)
├── creatorId → User (de quién son los datos)
├── shareCode (String, código usado)
├── levels → [Level]
├── seed (String)
├── prizeId → Prize
├── status ('active' | 'completed' | 'abandoned')
├── completed (Boolean)
└── lastPlayedAt (Date)

Level
├── gameSetId → GameSet
├── categoryId → Category
├── tipoDato → Variable
├── completed (Boolean)
├── currentAttempts (Number)
└── attempts: [{ answer, isCorrect, attemptedAt }] // NUEVO
```

---

## 🧾 E. Recomendaciones Finales

### 1. Correcciones Críticas Inmediatas

#### ⚠️ Prioridad Alta: Implementar ruta de verificación de niveles

**Problema:** El frontend llama a `/api/level/:levelId/verify` pero la ruta no existe.

**Solución:**
```javascript
// backend/src/routes/game.routes.js
router.post('/level/:levelId/verify', gameController.verifyLevel);
```

**Impacto:** Sin esto, el juego no funciona.

---

### 2. Endpoints que Necesitan Ampliación

| Endpoint Actual | Problema | Endpoint Propuesto |
|----------------|----------|-------------------|
| `GET /api/levels` | Solo retorna niveles del set activo | `GET /api/game/sets/:setId/levels` |
| `GET /api/progress` | Solo muestra progreso del juego activo | `GET /api/game/sets/:setId/progress` |
| `POST /api/reset` | Elimina historial | `POST /api/game/sets/:setId/reset` (sin eliminar) |
| (no existe) | No hay forma de listar juegos | `GET /api/game/sets?status=active` |
| (no existe) | No se puede cambiar de juego | `POST /api/game/sets/:setId/activate` |
| (no existe) | No hay estadísticas | `GET /api/game/stats` |

---

### 3. Campos Nuevos Sugeridos

#### GameSet (Opción B)
```javascript
{
  // Nuevos
  playerId: ObjectId → User,        // quien juega
  creatorId: ObjectId → User,       // de quién son los datos
  shareCode: String,                // código usado
  status: enum,                     // 'active' | 'completed' | 'abandoned'
  lastPlayedAt: Date,               // última vez que jugó
  
  // Mantener
  userId: ObjectId → User,          // DEPRECAR (conflicto con playerId)
  gameInstanceId: ObjectId,         // ELIMINAR
}
```

#### Level
```javascript
{
  // Nuevo
  attempts: [{
    answer: String,                 // hash o respuesta ofuscada
    isCorrect: Boolean,
    attemptedAt: Date,
    hintShown: String               // qué pista se mostró
  }],
  
  // Mantener todos los campos actuales
}
```

#### User
```javascript
{
  // Modificar
  activeGameSetId: ObjectId → GameSet,  // antes: currentSetId
  
  // Eliminar
  completedLevels: [],              // mover a GameSet/Level
  currentSetId: ObjectId,           // reemplazar por activeGameSetId
  currentPrizeId: [],               // conflicto de tipo, eliminar
  activeGameInstances: [],          // eliminar con GameInstance
  
  // Nuevo
  stats: {
    totalGamesPlayed: Number,
    totalLevelsCompleted: Number,
    totalPrizesWon: Number,
    averageCompletionTime: Number
  }
}
```

---

### 4. Recomendaciones de Naming Consistente

| Nombre Actual | Problema | Nombre Propuesto |
|--------------|----------|------------------|
| `GameSet` | Confuso, suena a "conjunto de juegos" | `Game` o `GameSession` |
| `GameInstance` | Redundante con GameSet | `Game` (si se fusiona) |
| `Level` | OK pero podría ser más específico | `Challenge` o `GameLevel` |
| `UserData` | Genérico | `PersonalData` o `CustomData` |
| `currentSetId` | Inconsistente con `activeGameInstances` | `activeGameId` o `activeSessionId` |

**Propuesta de renombrado completo:**
```
GameInstance + GameSet → Game
Level → Challenge
UserData → PersonalData
GameShare → ShareCode o GameInvite
```

---

### 5. Evaluación de Escalabilidad y Mantenibilidad

| Aspecto | Estado Actual | Con Opción B | Mejora |
|---------|--------------|--------------|--------|
| **Múltiples juegos activos** | ❌ Solo uno global | ✅ N juegos, cambio entre ellos | 🚀 +100% |
| **Historial de partidas** | ❌ Se borra al resetear | ✅ Todas las partidas se guardan | 🚀 +100% |
| **Consistencia de datos** | ❌ Duplicación en 3 modelos | ✅ Datos en un solo lugar | 🚀 +80% |
| **Claridad de responsabilidades** | ⚠️ Confusión User/Instance/Set | ✅ User → Game → Challenge | 🚀 +90% |
| **Complejidad del código** | ⚠️ Sincronización manual | ✅ Lógica centralizada | 🚀 +70% |
| **Performance de consultas** | ⚠️ Múltiples populate | ✅ Menos joins necesarios | 🚀 +40% |
| **Facilidad de testing** | ⚠️ Muchos mocks necesarios | ✅ Menos dependencias | 🚀 +60% |

---

### 6. Checklist de Refactor (si se elige Opción B)

#### Fase 1: Preparación (sin romper nada)
- [ ] Añadir campos nuevos a `GameSet`: `playerId`, `creatorId`, `shareCode`, `status`, `lastPlayedAt`
- [ ] Crear índices: `{ playerId: 1, status: 1 }`, `{ shareCode: 1 }`
- [ ] Añadir campo `attempts: []` a `Level`

#### Fase 2: Migración de datos
- [ ] Script para copiar datos de `GameInstance` a `GameSet`:
  ```javascript
  const instances = await GameInstance.find();
  for (const instance of instances) {
    await GameSet.findOneAndUpdate(
      { gameInstanceId: instance._id },
      {
        playerId: instance.playerId,
        creatorId: instance.creatorId,
        shareCode: instance.shareCode,
        status: instance.active ? 'active' : 'completed'
      }
    );
  }
  ```
- [ ] Migrar `User.currentSetId` a `User.activeGameSetId`
- [ ] Calcular y guardar estadísticas en `User.stats`

#### Fase 3: Actualizar servicios
- [ ] Modificar `generateNewGameSet()` para aceptar `playerId`, `creatorId`, `shareCode`
- [ ] Actualizar `checkGameSetCompletion()` para no depender de `User.currentSetId`
- [ ] Modificar `assignPrize()` para usar `GameSet.prizeId`
- [ ] Eliminar referencias a `GameInstance` en servicios

#### Fase 4: Actualizar controladores
- [ ] `share.controller.js → joinGame()`: crear/buscar GameSet directamente
- [ ] `game.controller.js`: eliminar dependencias de `User.currentSetId`
- [ ] Implementar `activateGameSet()` para cambiar entre juegos
- [ ] Implementar `getGameSets()` para listar historial

#### Fase 5: Actualizar rutas
- [ ] ⚠️ **CRÍTICO:** Añadir `POST /api/game/level/:levelId/verify`
- [ ] Añadir `GET /api/game/sets`
- [ ] Añadir `POST /api/game/sets/:id/activate`
- [ ] Añadir `GET /api/game/sets/:id/progress`
- [ ] Renombrar `/api/share/instances` a `/api/share/games`

#### Fase 6: Actualizar frontend
- [ ] Actualizar `api.js` para usar nuevos endpoints
- [ ] Modificar `useGame.js` para manejar múltiples juegos
- [ ] Añadir UI para cambiar entre juegos activos
- [ ] Añadir pantalla de historial de juegos

#### Fase 7: Limpieza
- [ ] Eliminar modelo `GameInstance`
- [ ] Eliminar campos deprecados de `User`: `currentSetId`, `completedLevels`, `currentPrizeId`, `activeGameInstances`
- [ ] Eliminar índices antiguos
- [ ] Actualizar documentación

---

### 7. Alternativa: Mejora Incremental (Opción A Light)

Si un refactor completo no es viable ahora, estas mejoras mínimas son críticas:

1. **Implementar la ruta faltante:**
   ```javascript
   // game.routes.js
   router.post('/level/:levelId/verify', gameController.verifyLevel);
   ```

2. **Sincronizar `completedLevels` entre User y GameInstance:**
   ```javascript
   // game.controller.js → verifyLevel()
   if (isCorrect) {
     await User.findByIdAndUpdate(userId, {
       $addToSet: { completedLevels: level._id }
     });
     await GameInstance.findOneAndUpdate(
       { playerId: userId, active: true },
       { $addToSet: { completedLevels: level._id } }
     );
   }
   ```

3. **Permitir cambiar entre GameInstance activas:**
   ```javascript
   // Nuevo endpoint: POST /api/game/instances/:id/activate
   router.post('/instances/:id/activate', async (req, res) => {
     const { id } = req.params;
     const userId = req.user._id;
     
     const instance = await GameInstance.findOne({ _id: id, playerId: userId });
     if (!instance) return res.status(404).json({ message: 'No encontrada' });
     
     await User.findByIdAndUpdate(userId, {
       currentSetId: instance.currentSetId
     });
     
     res.json({ success: true });
   });
   ```

4. **No eliminar historial en reset:**
   ```javascript
   // gameset.service.js → resetAndGenerateNewSet()
   // CAMBIAR:
   await Level.deleteMany({ _id: { $in: oldLevelIds } }); // ❌ NO HACER
   
   // POR:
   await GameSet.updateMany(
     { userId, active: true },
     { active: false, status: 'abandoned' }
   );
   ```

---

## 📊 Resumen Ejecutivo

### Estado Actual
- ✅ Sistema funcional para un juego activo por usuario
- ❌ **Ruta crítica faltante:** `/api/level/:levelId/verify`
- ❌ Duplicación de datos en User, GameInstance, GameSet
- ❌ No soporta múltiples juegos activos
- ❌ Elimina historial al resetear
- ⚠️ Inconsistencia en tipos de datos (`currentPrizeId`)

### Problemas Críticos
1. **Endpoint roto:** Verificación de niveles no funciona
2. **Limitación arquitectónica:** Solo un juego activo global
3. **Pérdida de datos:** Reset elimina historial
4. **Redundancia:** 3 modelos almacenan progreso del jugador

### Recomendación Principal
**Opción B: Fusionar GameInstance en GameSet**
- Simplifica de 4 modelos a 3
- Elimina duplicación de datos
- Permite múltiples juegos activos
- Conserva historial completo
- Reduce complejidad del código

### Acciones Inmediatas
1. ⚠️ **URGENTE:** Implementar `POST /api/game/level/:levelId/verify`
2. Decidir entre Opción A o B para refactor
3. Si no hay tiempo para refactor: aplicar mejoras incrementales (Opción A Light)
4. Planificar migración de datos si se elige Opción B

---

**Fin del análisis**
