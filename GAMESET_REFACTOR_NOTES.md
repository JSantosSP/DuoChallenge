# GameSet Refactor - Documentación Técnica

## 📋 Resumen

Se ha realizado una refactorización importante en la arquitectura del sistema de juegos, eliminando el modelo `GameInstance` y consolidando toda la lógica en `GameSet`. Este cambio simplifica la arquitectura, permite múltiples juegos activos simultáneamente, y agrega funcionalidades de historial y estadísticas.

---

## 🎯 Objetivo

Simplificar la arquitectura de juego eliminando redundancia entre `GameInstance` y `GameSet`, permitiendo que un usuario pueda tener múltiples juegos activos, mantener historial completo de partidas y obtener estadísticas de progreso.

---

## 🔄 Cambios Realizados

### 1. Modelo GameSet (Actualizado)

**Antes:**
```javascript
{
  userId: ObjectId,
  levels: [ObjectId],
  seed: String,
  prizeId: ObjectId,
  completed: Boolean,
  completedAt: Date,
  active: Boolean
}
```

**Después:**
```javascript
{
  userId: ObjectId,              // Jugador que juega este set
  creatorId: ObjectId,           // Creador del contenido (para juegos compartidos)
  shareId: ObjectId,             // Referencia al GameShare (si proviene de código)
  shareCode: String,             // Código usado (si aplica)
  levels: [ObjectId],            // Niveles del juego
  seed: String,                  // Seed para generación aleatoria
  prizeId: ObjectId,             // Premio asignado al completar
  status: String,                // 'active' | 'completed' | 'abandoned'
  startedAt: Date,               // Fecha de inicio
  completedAt: Date,             // Fecha de completado
  completedLevels: [ObjectId],   // IDs de niveles completados
  totalLevels: Number,           // Total de niveles en el set
  progress: Number,              // Porcentaje de progreso (0-100)
  active: Boolean                // Si está activo o no
}
```

**Índices añadidos:**
- `{ userId: 1, status: 1 }` - Para búsquedas de juegos por usuario y estado
- `{ creatorId: 1 }` - Para búsquedas de juegos creados por un usuario
- `{ shareId: 1 }` - Para búsquedas de juegos vinculados a un share

### 2. Modelo GameInstance (Eliminado)

El modelo `GameInstance` ha sido completamente eliminado. Su funcionalidad ha sido absorbida por `GameSet`.

**Campos migrados:**
- `playerId` → `userId`
- `creatorId` → `creatorId`
- `shareCode` → `shareCode`
- `currentSetId` → Ya no es necesario, cada GameSet es independiente
- `completedLevels` → `completedLevels`
- `currentPrizeId` → `prizeId`

### 3. Modelo User (Actualizado)

**Campos eliminados:**
```javascript
currentSetId         // Ya no se necesita un único juego activo
completedLevels      // Ahora gestionado por cada GameSet
currentPrizeId       // Ahora gestionado por cada GameSet
activeGameInstances  // Ya no existe GameInstance
```

**Campos mantenidos:**
```javascript
totalSetsCompleted   // Contador global de juegos completados
```

### 4. Servicios Actualizados

#### gameset.service.js

**`generateNewGameSet(creatorId, playerId, shareId, shareCode)`**
- Parámetros actualizados para eliminar dependencia de GameInstance
- Ahora acepta directamente playerId, shareId y shareCode
- Crea GameSet con todos los campos necesarios de una vez

**`checkGameSetCompletion(gameSetId)`**
- Antes recibía `userId` y buscaba el currentSetId
- Ahora recibe directamente `gameSetId`
- Actualiza el estado del GameSet a 'completed'
- Actualiza el progreso a 100%

**`resetAndGenerateNewSet(userId)`**
- Marca juegos activos como 'abandoned' en lugar de solo desactivarlos
- Crea nuevo GameSet para el usuario

**`updateGameSetProgress(gameSetId)` (nuevo)**
- Actualiza el progreso de un GameSet basado en niveles completados
- Calcula el porcentaje de completitud

### 5. Controladores Actualizados

#### share.controller.js

**`joinGame(req, res)`**
- Antes: Creaba GameInstance y luego GameSet
- Ahora: Crea directamente un GameSet con la información del share
- Elimina lógica redundante de instancias

**`getGameInstances(req, res)`**
- Antes: Devolvía GameInstances
- Ahora: Devuelve GameSets donde shareId no es null
- Mantiene compatibilidad con el frontend

#### game.controller.js

**`generateGame(req, res)`**
- Actualizado para usar nueva firma de generateNewGameSet
- Crea juego personal (userId === creatorId)

**`getLevels(req, res)`**
- Antes: Usaba user.currentSetId
- Ahora: Recibe gameSetId como parámetro de ruta
- `GET /api/game/:gameSetId/levels`

**`getProgress(req, res)`**
- Antes: Usaba user.currentSetId
- Ahora: Recibe gameSetId como parámetro
- `GET /api/game/:gameSetId/progress`

**`verifyLevel(req, res)`**
- Actualizado para actualizar completedLevels y progress en GameSet
- Elimina actualización de completedLevels en User
- Llama a checkGameSetCompletion con gameSetId

**`getHistory(req, res)` (nuevo)**
- `GET /api/game/history`
- Devuelve todos los GameSets del usuario
- Acepta filtro por status: `?status=completed|active|abandoned`

**`getStats(req, res)` (nuevo)**
- `GET /api/game/stats`
- Devuelve estadísticas agregadas:
  - totalGames: Total de juegos
  - completedGames: Juegos completados
  - activeGames: Juegos activos
  - abandonedGames: Juegos abandonados
  - averageProgress: Progreso promedio
  - totalLevelsCompleted: Niveles completados en total
  - totalLevelsAvailable: Niveles totales disponibles
  - gamesFromShares: Juegos desde códigos compartidos
  - ownGames: Juegos propios
  - completionRate: Tasa de completitud (%)

**`getActiveGames(req, res)` (nuevo)**
- `GET /api/game/active`
- Devuelve todos los juegos con status 'active'

---

## 🛣️ Endpoints Actualizados

### Nuevos Endpoints

```
GET  /api/game/history          - Obtener historial de juegos (con filtro ?status)
GET  /api/game/stats            - Obtener estadísticas del usuario
GET  /api/game/active           - Obtener juegos activos
```

### Endpoints Modificados

```
GET  /api/game/:gameSetId/levels     - Obtener niveles de un juego específico
GET  /api/game/:gameSetId/progress   - Obtener progreso de un juego específico
POST /api/game/level/:levelId/verify - Verificar respuesta de un nivel
```

### Endpoints Sin Cambios

```
POST /api/game/generate         - Generar nuevo juego
POST /api/game/reset            - Reiniciar juego
GET  /api/game/prize            - Obtener premio
GET  /api/game/level/:LevelId   - Obtener un nivel específico
POST /api/share/join            - Unirse a un juego compartido
GET  /api/share/instances       - Ahora devuelve GameSets en lugar de GameInstances
```

---

## 📊 Flujo de Juego Actualizado

### Flujo 1: Usuario crea su propio juego

1. Usuario autenticado llama a `POST /api/game/generate`
2. Se crea un GameSet donde `userId === creatorId`
3. Se generan niveles aleatorios basados en los UserData del creador
4. Se devuelve el GameSet con sus niveles

### Flujo 2: Usuario se une a un juego compartido

1. Usuario A crea un código compartido: `POST /api/share/create`
2. Usuario B usa el código: `POST /api/share/join` con `{ code: "ABC123" }`
3. Se crea un GameSet donde:
   - `userId` = Usuario B (jugador)
   - `creatorId` = Usuario A (creador del contenido)
   - `shareId` = ID del GameShare
   - `shareCode` = "ABC123"
4. Se generan niveles usando los UserData de Usuario A
5. Usuario B juega con los datos de Usuario A

### Flujo 3: Jugar un nivel

1. Usuario obtiene niveles: `GET /api/game/:gameSetId/levels`
2. Usuario responde un nivel: `POST /api/game/level/:levelId/verify`
3. Si es correcto:
   - El nivel se marca como completado
   - Se agrega a `completedLevels` del GameSet
   - Se actualiza el `progress` del GameSet
   - Si todos los niveles están completados:
     - GameSet.status → 'completed'
     - Se asigna un premio
     - GameSet.active → false

### Flujo 4: Ver historial y estadísticas

1. Ver todos los juegos: `GET /api/game/history`
2. Ver solo completados: `GET /api/game/history?status=completed`
3. Ver estadísticas: `GET /api/game/stats`
4. Ver juegos activos: `GET /api/game/active`

---

## 🔀 Migración de Datos

Si ya existen datos en producción, se recomienda:

### Script de Migración (SQL-like pseudocódigo)

```javascript
// Migración de GameInstances a GameSets
const migrateGameInstances = async () => {
  const gameInstances = await GameInstance.find({});
  
  for (const instance of gameInstances) {
    // Buscar el GameSet actual
    const currentSet = await GameSet.findById(instance.currentSetId);
    
    if (currentSet) {
      // Actualizar GameSet con información de la instancia
      currentSet.creatorId = instance.creatorId;
      currentSet.shareId = null; // Buscar por shareCode si existe
      currentSet.shareCode = instance.shareCode;
      currentSet.completedLevels = instance.completedLevels || [];
      
      // Si tiene shareCode, buscar el GameShare
      if (instance.shareCode) {
        const gameShare = await GameShare.findOne({ code: instance.shareCode });
        if (gameShare) {
          currentSet.shareId = gameShare._id;
        }
      }
      
      await currentSet.save();
    }
    
    // Buscar otros GameSets antiguos de esta instancia
    const oldSets = await GameSet.find({ 
      gameInstanceId: instance._id 
    });
    
    for (const oldSet of oldSets) {
      oldSet.creatorId = instance.creatorId;
      oldSet.shareId = currentSet.shareId;
      oldSet.shareCode = instance.shareCode;
      oldSet.status = oldSet.completed ? 'completed' : 'abandoned';
      await oldSet.save();
    }
  }
  
  // Limpiar campos obsoletos de User
  await User.updateMany({}, {
    $unset: { 
      currentSetId: "",
      completedLevels: "",
      currentPrizeId: "",
      activeGameInstances: ""
    }
  });
  
  console.log('Migración completada');
};
```

### Pasos para Migración

1. **Backup de la base de datos**
   ```bash
   mongodump --uri="mongodb://..." --out=/backup/pre-refactor
   ```

2. **Ejecutar script de migración**
   ```javascript
   node scripts/migrate-gameinstances.js
   ```

3. **Verificar datos migrados**
   - Verificar que todos los GameSets tienen creatorId
   - Verificar que los GameSets con shareCode tienen shareId
   - Verificar que los status están correctamente asignados

4. **Eliminar colección GameInstance**
   ```javascript
   db.gameinstances.drop()
   ```

---

## ⚠️ Consideraciones Importantes

### Compatibilidad con GameShare

- ✅ GameShare se mantiene sin cambios
- ✅ Los códigos compartidos siguen funcionando igual
- ✅ El campo `usedBy` en GameShare sigue registrando usuarios

### Compatibilidad con Level

- ✅ Level se mantiene sin cambios
- ✅ El campo `gameSetId` sigue referenciando correctamente
- ✅ La lógica de completitud de niveles es la misma

### Múltiples Juegos Activos

- ✅ Un usuario puede tener múltiples GameSets activos simultáneamente
- ✅ Cada GameSet es independiente
- ✅ El usuario puede jugar su propio juego y juegos compartidos al mismo tiempo

### Progreso y Estadísticas

- ✅ El progreso ahora es por GameSet, no global del usuario
- ✅ Las estadísticas agregadas están disponibles en `/api/game/stats`
- ✅ El historial completo está en `/api/game/history`

---

## 🚀 Futuras Mejoras Sugeridas

### 1. Sistema de Repetición de Juegos
- Permitir reiniciar un GameSet completado
- Crear nuevo GameSet usando el mismo seed
- Comparar tiempos y puntuaciones

### 2. Rankings y Competitividad
- Tabla de clasificación por tiempo de completitud
- Puntuación basada en intentos usados
- Comparación con otros jugadores del mismo GameShare

### 3. Detalles de Niveles Completados
- Endpoint para ver niveles completados de un GameSet
- Historial de intentos por nivel
- Tiempo dedicado a cada nivel

### 4. Gestión Mejorada de Juegos Abandonados
- Auto-abandonar juegos sin actividad por X días
- Opción de reactivar juegos abandonados
- Limpieza automática de juegos muy antiguos

### 5. Notificaciones
- Notificar cuando alguien usa tu código
- Notificar cuando se completa un juego compartido
- Estadísticas semanales/mensuales

### 6. Exportación de Datos
- Exportar historial de juegos a CSV/JSON
- Exportar estadísticas personales
- Compartir logros en redes sociales

---

## 📝 Notas de Desarrollo

### Testing Recomendado

1. **Tests Unitarios**
   - Probar `generateNewGameSet` con diferentes parámetros
   - Probar `checkGameSetCompletion` con diferentes estados
   - Probar cálculo de estadísticas

2. **Tests de Integración**
   - Flujo completo: crear juego → jugar → completar
   - Flujo completo: crear share → unirse → jugar
   - Múltiples juegos activos simultáneos

3. **Tests de Migración**
   - Migrar datos de prueba
   - Verificar integridad post-migración
   - Verificar que no hay referencias rotas

### Limpieza de Código

- ❌ Eliminar imports de GameInstance en archivos no actualizados
- ❌ Eliminar comentarios obsoletos que referencien GameInstance
- ❌ Actualizar documentación API si existe
- ❌ Actualizar README del proyecto

---

## 🐛 Issues Conocidos

### Ninguno identificado por el momento

Si encuentras algún problema con la refactorización, por favor documéntalo aquí.

---

## 👥 Cambios en el Frontend

### Mobile App

**Archivos que necesitan actualización:**
- `src/hooks/useGame.js` - Actualizar para usar gameSetId en lugar de currentSetId
- `src/screens/HomeScreen.js` - Mostrar múltiples juegos activos
- `src/screens/LevelScreen.js` - Pasar gameSetId a las peticiones
- `src/navigation/AppNavigator.js` - Ajustar navegación para seleccionar gameSet

**Nuevas funcionalidades sugeridas:**
- Pantalla de selección de juego activo
- Pantalla de historial de juegos
- Pantalla de estadísticas personales

### Backoffice

No requiere cambios inmediatos, ya que gestiona categorías, premios y usuarios, no la lógica de juego directamente.

---

## 📅 Changelog

### [2.0.0] - 2025-10-22

#### Added
- Campo `creatorId` en GameSet
- Campo `shareId` en GameSet
- Campo `shareCode` en GameSet
- Campo `status` en GameSet ('active', 'completed', 'abandoned')
- Campo `startedAt` en GameSet
- Campo `completedLevels` en GameSet
- Campo `totalLevels` en GameSet
- Campo `progress` en GameSet
- Endpoint `GET /api/game/history`
- Endpoint `GET /api/game/stats`
- Endpoint `GET /api/game/active`
- Endpoint `GET /api/game/:gameSetId/levels`
- Endpoint `GET /api/game/:gameSetId/progress`
- Servicio `updateGameSetProgress`
- Índices en GameSet para optimización

#### Changed
- `generateNewGameSet` acepta `(creatorId, playerId, shareId, shareCode)`
- `checkGameSetCompletion` recibe `gameSetId` en lugar de `userId`
- `joinGame` crea GameSet directamente sin GameInstance
- `verifyLevel` actualiza progreso en GameSet
- `getGameInstances` ahora devuelve GameSets

#### Removed
- Modelo `GameInstance` completamente eliminado
- Campo `currentSetId` de User
- Campo `completedLevels` de User
- Campo `currentPrizeId` de User
- Campo `activeGameInstances` de User
- Campo `completed` de GameSet (reemplazado por `status`)

---

## 📚 Referencias

- **Modelo GameSet**: `/backend/src/models/GameSet.model.js`
- **Servicio GameSet**: `/backend/src/services/gameset.service.js`
- **Controlador Game**: `/backend/src/controllers/game.controller.js`
- **Controlador Share**: `/backend/src/controllers/share.controller.js`
- **Rutas Game**: `/backend/src/routes/game.routes.js`

---

**Documentación generada el**: 2025-10-22  
**Autor de la refactorización**: Cursor AI Background Agent  
**Versión del sistema**: 2.0.0
