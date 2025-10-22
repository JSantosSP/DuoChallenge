# 🏆 User Won Prizes - Documentación Técnica

## Resumen

Se ha implementado un sistema completo para que los usuarios puedan consultar el historial de todos los premios ganados al completar juegos (GameSets).

## 📍 Cambios Realizados

### 1. **Modelo GameSet**
El modelo `GameSet.model.js` ya contaba con los campos necesarios:
- `prizeId`: Referencia al premio asociado al GameSet
- `status`: Estado del juego ('active', 'completed', 'abandoned')
- `completedAt`: Fecha de finalización del juego

No se requirieron cambios adicionales en el modelo.

### 2. **Nuevo Endpoint: GET /api/prizes/won**

**Ubicación**: `backend/src/controllers/prize.controller.js`

**Función**: `getUserWonPrizes`

**Descripción**: Devuelve todos los premios ganados por el usuario autenticado.

**Autenticación**: Requiere token JWT (middleware `verifyToken`)

**Respuesta de Ejemplo**:
```json
{
  "success": true,
  "data": {
    "prizes": [
      {
        "prizeId": "6718b9a9c123abc",
        "title": "Cena romántica sorpresa",
        "description": "Vale por una cena hecha con amor.",
        "imagePath": "/uploads/dinner.png",
        "weight": 5,
        "completedAt": "2025-10-19T22:14:00.000Z",
        "gameSetId": "6718b9a9c456def",
        "used": true,
        "usedAt": "2025-10-19T22:14:00.000Z"
      },
      {
        "prizeId": "6718b9a9c789ghi",
        "title": "Escapada de fin de semana",
        "description": "Un viaje juntos a la montaña.",
        "imagePath": "/uploads/mountain.png",
        "weight": 8,
        "completedAt": "2025-09-01T18:22:00.000Z",
        "gameSetId": "6718b9a9c456abc",
        "used": false,
        "usedAt": null
      }
    ],
    "total": 2
  }
}
```

**Características**:
- Lista los premios ordenados por fecha de obtención (más recientes primero)
- Incluye información completa del premio (título, descripción, imagen, peso)
- Muestra la fecha de completación del juego asociado
- Indica si el premio ha sido usado (`used` y `usedAt`)
- Devuelve el total de premios ganados

### 3. **Ruta Agregada**

**Archivo**: `backend/src/routes/prize.routes.js`

```javascript
router.get('/won', prizeController.getUserWonPrizes);
```

La ruta se agregó después de la ruta principal `GET /` para evitar conflictos de routing.

### 4. **Estadísticas Actualizadas**

**Archivo**: `backend/src/controllers/game.controller.js`

**Endpoint**: `GET /api/game/stats`

Se agregó el campo `prizesWon` a las estadísticas del usuario:

```javascript
const prizesWon = await GameSet.countDocuments({ 
  userId, 
  status: 'completed', 
  prizeId: { $ne: null } 
});
```

**Respuesta Actualizada**:
```json
{
  "success": true,
  "data": {
    "totalGames": 15,
    "completedGames": 8,
    "activeGames": 2,
    "abandonedGames": 5,
    "averageProgress": 67,
    "totalLevelsCompleted": 45,
    "totalLevelsAvailable": 60,
    "gamesFromShares": 3,
    "ownGames": 12,
    "prizesWon": 8,
    "completionRate": 53
  }
}
```

## 🔄 Flujo de Funcionamiento

### Cuando un usuario completa un juego:

1. El usuario completa el último nivel de un GameSet
2. Se ejecuta `checkGameSetCompletion()` en `gameset.service.js`
3. El sistema:
   - Marca el GameSet como 'completed'
   - Establece `completedAt` con la fecha actual
   - Asigna un premio usando `assignPrize()` 
   - Guarda la referencia del premio en `prizeId`
   - Marca el premio como usado (`used: true`, `usedAt: Date`)

### Cuando un usuario consulta sus premios ganados:

1. El usuario realiza una petición `GET /api/prizes/won`
2. El backend busca todos los GameSets completados con premio asociado
3. Se devuelve la lista completa con información detallada

## 📋 Endpoints Relacionados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/prizes/won` | Obtener premios ganados por el usuario |
| `GET` | `/api/prizes` | Obtener premios disponibles del usuario |
| `GET` | `/api/game/stats` | Estadísticas incluyendo premios ganados |
| `GET` | `/api/game/history` | Historial de juegos (incluye premios) |
| `GET` | `/api/game/:gameSetId/progress` | Progreso de un juego específico |

## 💡 Uso desde Frontend

### Ejemplo React/React Native:

```javascript
// Obtener premios ganados
const fetchWonPrizes = async () => {
  try {
    const response = await api.get('/prizes/won');
    const { prizes, total } = response.data.data;
    
    console.log(`Total de premios ganados: ${total}`);
    prizes.forEach(prize => {
      console.log(`- ${prize.title} (ganado el ${prize.completedAt})`);
    });
    
    return prizes;
  } catch (error) {
    console.error('Error obteniendo premios:', error);
  }
};

// Obtener estadísticas incluyendo premios
const fetchStats = async () => {
  try {
    const response = await api.get('/game/stats');
    const stats = response.data.data;
    
    console.log(`Premios ganados: ${stats.prizesWon}`);
    console.log(`Juegos completados: ${stats.completedGames}`);
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
};
```

### Ejemplo cURL:

```bash
# Obtener premios ganados
curl -X GET http://localhost:3000/api/prizes/won \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Obtener estadísticas
curl -X GET http://localhost:3000/api/game/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ✅ Compatibilidad

- **No rompe funcionalidad existente**: Todos los cambios son aditivos
- **Retrocompatible**: Los endpoints existentes siguen funcionando igual
- **Sin migraciones requeridas**: Los campos necesarios ya existían en el modelo
- **Autenticación estándar**: Usa el mismo middleware que el resto de endpoints

## 🔐 Seguridad

- Todos los endpoints requieren autenticación mediante JWT
- Los usuarios solo pueden ver sus propios premios ganados
- No se exponen datos sensibles (salt, answerHash, etc.)

## 📊 Consideraciones

1. **Rendimiento**: Los queries están indexados por `userId` y `status` en el modelo GameSet
2. **Ordenamiento**: Los premios se devuelven ordenados por fecha de obtención (más recientes primero)
3. **Paginación**: En el futuro, si el volumen de premios crece, se podría agregar paginación al endpoint `/won`

## 🚀 Próximas Mejoras Sugeridas

1. Agregar filtros al endpoint `/won` (por fecha, usado/no usado)
2. Implementar paginación para usuarios con muchos premios
3. Agregar endpoint para marcar un premio como "reclamado" o "usado"
4. Crear notificaciones cuando se gana un nuevo premio
5. Agregar métricas de premios más populares

---

**Fecha de implementación**: 2025-10-22  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y funcional
