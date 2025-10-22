# 🔗 Frontend API Sync - Referencia Completa

## 📋 Resumen

Este documento contiene la referencia completa de todos los endpoints del backend y su uso en el Backoffice y la App Móvil, asegurando sincronización total entre frontend y backend.

---

## 🌐 API Base URLs

### Backoffice
```javascript
// /backoffice/src/api/axios.js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
```

### Mobile App
```javascript
// /mobile/src/api/api.js
baseURL: __DEV__ 
  ? process.env.EXPO_PUBLIC_API_URL_DEV 
  : process.env.EXPO_PUBLIC_API_URL_PRO
```

---

## 🔐 Autenticación

### Endpoints

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `POST` | `/auth/login` | Login de usuario | ✅ | ✅ |
| `POST` | `/auth/refresh` | Refresh token | ❌ | ✅ |
| `GET` | `/auth/profile` | Obtener perfil | ❌ | ✅ |

### Uso en Mobile

```javascript
// /mobile/src/api/api.js
export const apiService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
}
```

**Headers enviados:**
```javascript
Authorization: Bearer ${token}
```

---

## 🎮 Game (Juegos)

### Endpoints Actualizados

| Método | Endpoint | Descripción | Backoffice | Mobile | Cambios |
|--------|----------|-------------|------------|--------|---------|
| `POST` | `/api/game/generate` | Generar juego | ❌ | ✅ | ✅ Ruta actualizada |
| `GET` | `/api/game/:gameSetId/levels` | Obtener niveles | ❌ | ✅ | ✅ Requiere gameSetId |
| `GET` | `/api/game/level/:levelId` | Obtener nivel específico | ❌ | ✅ | ✅ Ruta actualizada |
| `POST` | `/api/game/level/:levelId/verify` | Verificar respuesta | ❌ | ✅ | ✅ Ruta actualizada |
| `GET` | `/api/game/:gameSetId/progress` | Obtener progreso | ❌ | ✅ | ✅ Requiere gameSetId |
| `GET` | `/api/game/prize` | Obtener premio | ❌ | ✅ | Sin cambios |
| `POST` | `/api/game/reset` | Reiniciar juego | ❌ | ✅ | Sin cambios |
| `GET` | `/api/game/history` | Obtener historial | ❌ | ✅ | ⭐ NUEVO |
| `GET` | `/api/game/stats` | Estadísticas usuario | ❌ | ✅ | ⭐ NUEVO |
| `GET` | `/api/game/active` | Juegos activos | ❌ | ✅ | ⭐ NUEVO |

### Detalle de Endpoints

#### `POST /api/game/generate`

**Propósito:** Crear un nuevo GameSet para el usuario

**Request:**
```javascript
// Sin body
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "gameSet": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "creatorId": "507f1f77bcf86cd799439012",
      "levels": ["levelId1", "levelId2", ...],
      "totalLevels": 5,
      "completedLevels": [],
      "progress": 0,
      "status": "active",
      "active": true,
      "startedAt": "2025-10-22T10:00:00.000Z",
      "prizeId": null,
      "shareCode": null,
      "shareId": null
    }
  }
}
```

**Uso en Mobile:**
```javascript
// /mobile/src/hooks/useGame.js
const generateMutation = useMutation({
  mutationFn: () => apiService.generateGame(),
  onSuccess: (response) => {
    const newGameSet = response.data.data.gameSet;
    // Actualizar lista de juegos activos
  }
});
```

#### `GET /api/game/:gameSetId/levels`

**Propósito:** Obtener niveles de un GameSet específico

**Params:**
- `gameSetId` - ID del GameSet

**Response:**
```javascript
{
  "success": true,
  "data": {
    "levels": [
      {
        "_id": "levelId1",
        "gameSetId": "gameSetId",
        "tipoDato": {
          "type": "texto",
          "category": "Fechas especiales"
        },
        "pregunta": "¿En qué fecha nos conocimos?",
        "completed": false,
        "order": 1,
        "maxAttempts": 5,
        "currentAttempts": 0,
        "pistas": ["Pista 1", "Pista 2"]
      },
      // ...más niveles
    ]
  }
}
```

**Uso en Mobile:**
```javascript
// /mobile/src/hooks/useGame.js
const { data: levels } = useQuery({
  queryKey: ['levels', gameSetId],
  queryFn: async () => {
    const response = await apiService.getLevels(gameSetId);
    return response.data.data.levels;
  },
  enabled: !!gameSetId,
});
```

#### `GET /api/game/:gameSetId/progress`

**Propósito:** Obtener progreso de un GameSet

**Response:**
```javascript
{
  "success": true,
  "data": {
    "gameSetId": "gameSetId",
    "progress": 60,
    "completedLevels": 3,
    "totalLevels": 5,
    "status": "active",
    "hasActiveGame": true
  }
}
```

#### `GET /api/game/history?status=completed`

**Propósito:** Obtener historial de juegos del usuario

**Query params:**
- `status` (opcional) - `completed`, `active`, `abandoned`

**Response:**
```javascript
{
  "success": true,
  "data": {
    "games": [
      {
        "_id": "gameSetId",
        "userId": "userId",
        "creatorId": "creatorId",
        "status": "completed",
        "progress": 100,
        "totalLevels": 5,
        "completedLevels": ["level1", "level2", ...],
        "startedAt": "2025-10-20T10:00:00.000Z",
        "completedAt": "2025-10-22T15:30:00.000Z",
        "prizeId": "prizeId",
        "shareCode": "ABC123",
        "shareId": "shareId"
      }
    ],
    "total": 10
  }
}
```

**Uso en Mobile:**
```javascript
// /mobile/src/screens/GameHistoryScreen.js
const history = await apiService.getGameHistory('completed');
```

#### `GET /api/game/stats`

**Propósito:** Obtener estadísticas del usuario

**Response:**
```javascript
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

#### `GET /api/game/active`

**Propósito:** Obtener juegos activos del usuario

**Response:**
```javascript
{
  "success": true,
  "data": {
    "games": [
      {
        "_id": "gameSetId1",
        "status": "active",
        "progress": 40,
        "totalLevels": 5,
        "completedLevels": ["level1", "level2"],
        "shareCode": null
      },
      {
        "_id": "gameSetId2",
        "status": "active",
        "progress": 80,
        "shareCode": "ABC123"
      }
    ]
  }
}
```

**Uso en Mobile:**
```javascript
// /mobile/src/hooks/useGame.js
const { data: activeGames } = useQuery({
  queryKey: ['activeGames'],
  queryFn: async () => {
    const response = await apiService.getActiveGames();
    return response.data.data.games;
  },
});
```

---

## 🏆 Prizes (Premios)

### Endpoints

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `GET` | `/api/prizes` | Premios del usuario | ❌ | ✅ |
| `GET` | `/api/prizes/won` | Premios ganados | ❌ | ✅ |
| `POST` | `/api/prizes` | Crear premio | ❌ | ✅ |
| `PUT` | `/api/prizes/:id` | Actualizar premio | ❌ | ✅ |
| `DELETE` | `/api/prizes/:id` | Eliminar premio | ❌ | ✅ |

### Detalle de Endpoints

#### `GET /api/prizes/won` ⭐ NUEVO

**Propósito:** Obtener premios ganados al completar juegos

**Response:**
```javascript
{
  "success": true,
  "data": {
    "prizes": [
      {
        "prizeId": "prizeId",
        "title": "Cena romántica",
        "description": "Una cena especial",
        "imagePath": "/uploads/image.jpg",
        "weight": 5,
        "completedAt": "2025-10-22T15:30:00.000Z",
        "gameSetId": "gameSetId",
        "used": true,
        "usedAt": "2025-10-22T18:00:00.000Z"
      }
    ],
    "total": 8
  }
}
```

**Uso en Mobile:**
```javascript
// /mobile/src/hooks/useGame.js
export const useWonPrizes = () => {
  const { data: wonPrizes } = useQuery({
    queryKey: ['wonPrizes'],
    queryFn: async () => {
      const response = await apiService.getWonPrizes();
      return response.data.data.prizes;
    },
  });
  return { wonPrizes, total: wonPrizes?.length || 0 };
};
```

---

## 🔗 Share (Compartir)

### Endpoints Actualizados

| Método | Endpoint | Descripción | Backoffice | Mobile | Cambios |
|--------|----------|-------------|------------|--------|---------|
| `POST` | `/api/share/generate` | Generar código | ❌ | ✅ | ✅ `/create` → `/generate` |
| `GET` | `/api/share/codes` | Códigos del usuario | ❌ | ✅ | Sin cambios |
| `GET` | `/api/share/verify/:code` | Verificar código | ❌ | ✅ | Sin cambios |
| `POST` | `/api/share/join` | Unirse con código | ❌ | ✅ | Sin cambios |
| `GET` | `/api/share/instances` | GameSets compartidos | ❌ | ✅ | ✅ Ahora devuelve GameSets |
| `DELETE` | `/api/share/:id` | Desactivar código | ❌ | ✅ | Sin cambios |

### Detalle de Endpoints

#### `POST /api/share/generate`

**Request:**
```javascript
// Sin body - usa el usuario autenticado
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "gameShare": {
      "_id": "shareId",
      "userId": "userId",
      "code": "ABC123",
      "active": true,
      "usedBy": [],
      "createdAt": "2025-10-22T10:00:00.000Z"
    }
  }
}
```

#### `GET /api/share/instances`

**Propósito:** Obtener GameSets de juegos compartidos (donde el usuario se unió con código)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "games": [
      {
        "_id": "gameSetId",
        "userId": "currentUserId",
        "creatorId": "otherUserId",
        "shareCode": "ABC123",
        "shareId": "shareId",
        "status": "active",
        "progress": 60
      }
    ]
  }
}
```

**Cambio importante:**
- **ANTES:** Devolvía `GameInstance`
- **DESPUÉS:** Devuelve `GameSet` donde `shareId` no es null

---

## 📝 UserData (Datos Personales)

### Endpoints

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `GET` | `/api/userdata` | Obtener datos | ❌ | ✅ |
| `GET` | `/api/userdata/types` | Tipos disponibles | ❌ | ✅ |
| `POST` | `/api/userdata` | Crear dato | ❌ | ✅ |
| `PUT` | `/api/userdata/:id` | Actualizar dato | ❌ | ✅ |
| `DELETE` | `/api/userdata/:id` | Eliminar dato | ❌ | ✅ |

**Uso en Mobile:**
```javascript
// /mobile/src/api/api.js
getUserData: () => api.get('/api/userdata'),
getAvailableTypes: () => api.get('/api/userdata/types'),
createUserData: (data) => api.post('/api/userdata', data),
updateUserData: (id, data) => api.put(`/api/userdata/${id}`, data),
deleteUserData: (id) => api.delete(`/api/userdata/${id}`),
```

---

## 🎨 Prize Templates (Plantillas de Premios)

### Endpoints

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `GET` | `/api/prize-templates` | Todas las plantillas | ❌ | ✅ |
| `GET` | `/api/prize-templates/:id` | Plantilla específica | ❌ | ✅ |

**Uso en Mobile:**
```javascript
// /mobile/src/api/api.js
getPrizeTemplates: () => api.get('/api/prize-templates'),
getPrizeTemplateById: (id) => api.get(`/api/prize-templates/${id}`),
```

---

## 📂 Categories (Categorías)

### Endpoints

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `GET` | `/api/categories` | Obtener categorías | ❌ | ✅ |

**Uso en Mobile:**
```javascript
// /mobile/src/api/api.js
getCategories: () => api.get('/api/categories'),
```

---

## 👥 Admin (Solo Backoffice)

### Endpoints

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `GET` | `/admin/stats` | Estadísticas globales | ✅ | ❌ |
| `GET` | `/admin/categories` | Listar categorías | ✅ | ❌ |
| `POST` | `/admin/categories` | Crear categoría | ✅ | ❌ |
| `PUT` | `/admin/categories/:id` | Actualizar categoría | ✅ | ❌ |
| `DELETE` | `/admin/categories/:id` | Eliminar categoría | ✅ | ❌ |
| `GET` | `/admin/prizes` | Premios del sistema | ✅ | ❌ |
| `POST` | `/admin/prizes` | Crear premio sistema | ✅ | ❌ |
| `PUT` | `/admin/prizes/:id` | Actualizar premio | ✅ | ❌ |
| `DELETE` | `/admin/prizes/:id` | Eliminar premio | ✅ | ❌ |
| `POST` | `/admin/prizes/reset` | Resetear premios | ✅ | ❌ |
| `POST` | `/admin/upload` | Subir imagen | ✅ | ✅ |

### Detalle de `/admin/stats`

**Response actualizada:**
```javascript
{
  "success": true,
  "data": {
    "users": { 
      "total": 150, 
      "players": 145, 
      "admins": 5 
    },
    "templates": { 
      "total": 25, 
      "active": 20 
    },
    "prizes": { 
      "total": 50, 
      "used": 30, 
      "available": 20 
    },
    "gameSets": {           // ✅ Actualizado (era "challenges")
      "total": 200,
      "completed": 120,
      "active": 50,
      "abandoned": 30
    },
    "levels": { 
      "total": 1000, 
      "completed": 600 
    },
    "variables": { 
      "total": 30 
    },
    "shares": {             // ⭐ NUEVO
      "total": 100,
      "active": 40,
      "used": 60
    }
  }
}
```

**Uso en Backoffice:**
```javascript
// /backoffice/src/pages/Dashboard.jsx
const { data: stats } = useFetch('stats', async () => {
  const res = await api.get('/admin/stats');
  return res.data.data;
});
```

---

## 📤 Upload (Subida de Archivos)

### Endpoint

| Método | Endpoint | Descripción | Backoffice | Mobile |
|--------|----------|-------------|------------|--------|
| `POST` | `/admin/upload` | Subir imagen | ✅ | ✅ |

**Request:**
```javascript
const formData = new FormData();
formData.append('image', file);

// Headers
Content-Type: multipart/form-data
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "path": "/uploads/image-1234567890.jpg"
  }
}
```

**Uso en Mobile:**
```javascript
// /mobile/src/api/api.js
uploadImage: (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
```

---

## 🔄 Comparación: Antes vs Después

### Endpoints Eliminados

| Endpoint Antiguo | Reemplazo |
|------------------|-----------|
| `GET /api/levels` | `GET /api/game/:gameSetId/levels` |
| `GET /api/progress` | `GET /api/game/:gameSetId/progress` |
| `POST /api/generate` | `POST /api/game/generate` |
| `POST /api/share/create` | `POST /api/share/generate` |

### Endpoints Nuevos

- ✅ `GET /api/game/history`
- ✅ `GET /api/game/stats`
- ✅ `GET /api/game/active`
- ✅ `GET /api/prizes/won`

### Cambios en Estructura

**GameInstance → GameSet**
```javascript
// ANTES
GET /api/share/instances
Response: { instances: [GameInstance] }

// DESPUÉS
GET /api/share/instances
Response: { games: [GameSet] }
```

**Niveles ahora requieren gameSetId**
```javascript
// ANTES
GET /api/levels
// Usa el currentSetId del usuario

// DESPUÉS
GET /api/game/:gameSetId/levels
// Requiere especificar qué GameSet
```

---

## 🛠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Acción Frontend |
|--------|-------------|-----------------|
| `200` | OK | Procesar respuesta |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Mostrar mensaje de error |
| `401` | Unauthorized | Redirigir a login |
| `403` | Forbidden | Mostrar "Sin permisos" |
| `404` | Not Found | Mostrar "No encontrado" |
| `500` | Server Error | Mostrar "Error del servidor" |

### Estructura de Errores

```javascript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Descripción del error"
}
```

### Interceptores

**Backoffice:**
```javascript
// /backoffice/src/api/axios.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Mobile:**
```javascript
// /mobile/src/api/api.js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      Alert.alert('Sesión expirada', 'Por favor, inicia sesión nuevamente');
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 Resumen de Uso

### Backoffice (Solo Admin)

```javascript
✅ Usa:
- /admin/stats
- /admin/categories
- /admin/prizes
- /admin/upload

❌ No usa:
- /api/game/*
- /api/prizes/* (user)
- /api/share/*
- /api/userdata/*
```

### Mobile App (Usuarios)

```javascript
✅ Usa:
- /auth/*
- /api/game/*
- /api/prizes/* (user)
- /api/share/*
- /api/userdata/*
- /api/prize-templates/*
- /api/categories
- /admin/upload (solo este de admin)

❌ No usa:
- /admin/* (excepto upload)
```

---

## ✅ Checklist de Sincronización

### API Client

- [x] Backoffice: axios configurado con baseURL
- [x] Mobile: axios configurado con baseURL
- [x] Interceptores de autenticación implementados
- [x] Manejo de errores 401
- [x] Headers Authorization correctos

### Endpoints Game

- [x] `POST /api/game/generate` implementado
- [x] `GET /api/game/:gameSetId/levels` con gameSetId
- [x] `GET /api/game/:gameSetId/progress` con gameSetId
- [x] `GET /api/game/history` implementado
- [x] `GET /api/game/stats` implementado
- [x] `GET /api/game/active` implementado

### Endpoints Prizes

- [x] `GET /api/prizes/won` implementado
- [x] Hook `useWonPrizes` creado
- [x] Pantalla WonPrizes usando endpoint

### Endpoints Share

- [x] `POST /api/share/generate` (actualizado de `/create`)
- [x] `GET /api/share/instances` devuelve GameSets
- [x] Hook `useGameShare` actualizado

### Admin Stats

- [x] Backoffice usa `/admin/stats`
- [x] Dashboard muestra `gameSets` correctamente
- [x] Stats muestra `shares` en lugar de `challenges`

---

## 🧪 Testing de Endpoints

### Script de Prueba

```bash
#!/bin/bash

TOKEN="your_jwt_token_here"
API_URL="http://localhost:4000"

# Test: Generar juego
curl -X POST "$API_URL/api/game/generate" \
  -H "Authorization: Bearer $TOKEN"

# Test: Obtener juegos activos
curl -X GET "$API_URL/api/game/active" \
  -H "Authorization: Bearer $TOKEN"

# Test: Obtener historial
curl -X GET "$API_URL/api/game/history?status=completed" \
  -H "Authorization: Bearer $TOKEN"

# Test: Obtener estadísticas
curl -X GET "$API_URL/api/game/stats" \
  -H "Authorization: Bearer $TOKEN"

# Test: Obtener premios ganados
curl -X GET "$API_URL/api/prizes/won" \
  -H "Authorization: Bearer $TOKEN"

# Test: Admin stats (requiere admin token)
curl -X GET "$API_URL/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📚 Documentación Relacionada

- [GAMESET_REFACTOR_NOTES.md](./GAMESET_REFACTOR_NOTES.md) - Cambios en backend
- [USER_WON_PRIZES_NOTES.md](./USER_WON_PRIZES_NOTES.md) - Endpoint de premios ganados
- [BACKOFFICE_ADAPTATION_NOTES.md](./BACKOFFICE_ADAPTATION_NOTES.md) - Cambios en backoffice
- [MOBILE_ADAPTATION_NOTES.md](./MOBILE_ADAPTATION_NOTES.md) - Cambios en app móvil

---

**Fecha de actualización:** 2025-10-22  
**Versión:** 2.0.0  
**Estado:** ✅ Completado y sincronizado
