# Gestión de Uniones Duplicadas (Join Duplicate Logic)

## 📋 Descripción General

Este documento explica cómo se gestiona el caso en el que un usuario intenta unirse nuevamente a un juego usando un código compartido (GameShare) que ya había usado anteriormente.

## 🎯 Objetivo

Permitir que los usuarios puedan "reiniciar" un juego generando un nuevo GameSet desde el mismo código compartido, sin que el sistema genere errores por unión duplicada.

## 🔧 Implementación Técnica

### Backend - Share Controller

**Archivo:** `/workspace/backend/src/controllers/share.controller.js`

**Función:** `joinGame()`

#### Lógica de Manejo de Duplicados

```javascript
// 1. Buscar el código compartido
const gameShare = await GameShare.findOne({ code, active: true });

// 2. Verificar que no sea su propio código
if (gameShare.creatorId.toString() === playerId.toString()) {
  return res.status(400).json({
    success: false,
    message: 'No puedes usar tu propio código'
  });
}

// 3. Verificar si ya usó el código antes
const alreadyUsed = gameShare.usedBy.some(
  u => u.userId.toString() === playerId.toString()
);

// 4. Solo añadir a usedBy si es la primera vez
if (!alreadyUsed) {
  gameShare.usedBy.push({
    userId: playerId,
    joinedAt: new Date()
  });
  await gameShare.save();
}

// 5. SIEMPRE generar un nuevo GameSet (incluso si ya había usado el código)
const gameSet = await generateNewGameSet(
  gameShare.creatorId,
  playerId,
  gameShare._id,
  code
);
```

#### Comportamiento Clave

1. **Primera vez usando el código:**
   - El usuario se añade al array `usedBy` del GameShare
   - Se genera un nuevo GameSet
   - Mensaje: "Te has unido al juego exitosamente"

2. **Uso repetido del mismo código:**
   - El usuario NO se añade nuevamente a `usedBy` (evita duplicados)
   - Se genera un nuevo GameSet de todas formas
   - Mensaje: "Nuevo juego generado exitosamente"

## 🎮 Flujo de Usuario

### Escenario: Reiniciar Juego desde Settings

1. Usuario va a **Settings** → "Reiniciar Juego"
2. Se muestra un modal con códigos disponibles (extraídos de juegos activos)
3. Usuario selecciona un código
4. Sistema llama a `/api/share/join` con el código
5. Backend:
   - Valida que el código esté activo
   - Valida que no sea su propio código
   - Genera un nuevo GameSet (sin importar si ya lo había usado)
6. Frontend:
   - Recibe el nuevo GameSet
   - Navega a Home para comenzar el juego

### Escenario: Reiniciar desde PrizeScreen

1. Usuario completa un juego y ve su premio
2. Presiona "Iniciar Nuevo Juego"
3. Sistema usa el `shareCode` del juego completado
4. Llama al endpoint con el mismo código
5. Genera un nuevo GameSet automáticamente

## 📱 Código Frontend

### SettingsScreen

**Archivo:** `/workspace/mobile/src/screens/SettingsScreen.js`

```javascript
const handleRestartGame = async () => {
  await refetchActiveGames();
  
  // Extraer códigos únicos de juegos activos compartidos
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

  if (shareCodes.length === 0) {
    Alert.alert(
      'No hay códigos disponibles',
      'No tienes códigos compartidos disponibles...'
    );
    return;
  }

  setAvailableShareCodes(shareCodes);
  setShowRestartModal(true);
};
```

### PrizeScreen

**Archivo:** `/workspace/mobile/src/screens/PrizeScreen.js`

```javascript
const handleNewGame = async () => {
  if (!shareCode) {
    Alert.alert(
      'No se puede reiniciar',
      'Este juego no tiene un código de compartición válido...'
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

## ⚠️ Validaciones y Errores

### Errores Manejados

1. **Código inválido o expirado:**
   ```json
   {
     "success": false,
     "message": "Código no válido o expirado"
   }
   ```

2. **Intentar usar propio código:**
   ```json
   {
     "success": false,
     "message": "No puedes usar tu propio código"
   }
   ```

3. **No hay códigos disponibles (Frontend):**
   - Alert: "No tienes códigos compartidos disponibles para reiniciar un juego"

### Casos de Éxito

1. **Primera unión:**
   - Status: 200
   - Message: "Te has unido al juego exitosamente"
   - Data: `{ gameSet: {...} }`

2. **Unión repetida (reinicio):**
   - Status: 200
   - Message: "Nuevo juego generado exitosamente"
   - Data: `{ gameSet: {...} }`

## 🔒 Restricciones

1. ❌ **No se puede usar el propio código:** Un usuario no puede generar un juego desde un código que él mismo creó
2. ✅ **Múltiples GameSets del mismo código:** Un usuario puede tener varios GameSets activos generados desde el mismo código compartido
3. ✅ **No hay límite de reinicios:** Un usuario puede reiniciar un juego tantas veces como quiera (mientras el código esté activo)

## 📊 Diagrama de Flujo

```
Usuario presiona "Reiniciar Juego"
         ↓
Obtener juegos activos compartidos
         ↓
Extraer códigos únicos
         ↓
    ¿Hay códigos?
    ↙         ↘
  No          Sí
   ↓           ↓
Mostrar     Mostrar modal
 Alert      con códigos
             ↓
       Usuario selecciona
             ↓
       Confirmar acción
             ↓
    POST /api/share/join
             ↓
    ¿Ya usó el código?
    ↙              ↘
  No               Sí
   ↓                ↓
Añadir a        No añadir
 usedBy          a usedBy
   ↓                ↓
   └────┬───────────┘
        ↓
Generar nuevo GameSet
        ↓
Retornar GameSet
        ↓
Navegar a Home
```

## 🧪 Casos de Prueba

### Test 1: Primera vez usando un código
- **Acción:** Unirse a juego con código "ABC123"
- **Esperado:** GameShare.usedBy incluye al usuario, GameSet creado
- **Status:** ✅

### Test 2: Reiniciar juego con mismo código
- **Acción:** Volver a usar código "ABC123"
- **Esperado:** GameShare.usedBy sin duplicados, nuevo GameSet creado
- **Status:** ✅

### Test 3: Intentar usar propio código
- **Acción:** Usuario A intenta usar su propio código
- **Esperado:** Error 400 - "No puedes usar tu propio código"
- **Status:** ✅

### Test 4: Código inactivo
- **Acción:** Intentar usar código desactivado
- **Esperado:** Error 404 - "Código no válido o expirado"
- **Status:** ✅

## 📝 Notas de Implementación

1. **Tracking de uso:** El array `usedBy` en GameShare solo registra usuarios únicos, no el número de veces que usaron el código
2. **GameSets múltiples:** Cada uso del código (incluso repetido) genera un nuevo GameSet independiente
3. **Estado del código:** Los códigos pueden ser desactivados por el creador, lo que impide nuevos usos
4. **Límite de usos:** GameShare tiene un campo `maxUses` que puede limitar cuántos usuarios únicos pueden usar el código (no limita reinicios del mismo usuario)

## 🔄 Relación con Otros Documentos

- Ver [SETTINGS_RESTART_FIX.md](./SETTINGS_RESTART_FIX.md) para detalles de la implementación en Settings
- Ver [GAME_RESTART_REFACTOR_NOTES.md](./GAME_RESTART_REFACTOR_NOTES.md) para contexto histórico

---

**Última actualización:** 2025-10-24
**Versión:** 1.0
