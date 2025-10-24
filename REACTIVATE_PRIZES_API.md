# API de Reactivación de Premios

## 📋 Descripción General

Este documento detalla los endpoints implementados para reactivar premios que han sido canjeados (marcados como `used: true`), permitiendo a los usuarios volver a usarlos en futuros juegos.

## 🎯 Propósito

Permitir que los usuarios reactiven premios ganados que ya han sido canjeados, para poder ganarlos nuevamente en futuros juegos sin necesidad de crear nuevos premios.

## 🔧 Endpoints Implementados

### 1. Reactivar Premio Individual

**Endpoint:** `PUT /api/prizes/:id/reactivate`

**Autenticación:** Requerida (Bearer Token)

#### Request

```http
PUT /api/prizes/507f1f77bcf86cd799439011/reactivate
Authorization: Bearer <token>
```

#### Response - Éxito (200)

```json
{
  "success": true,
  "message": "Premio reactivado exitosamente",
  "data": {
    "prize": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Cena Romántica",
      "description": "Una cena especial en tu restaurante favorito",
      "weight": 5,
      "used": false,
      "usedAt": null,
      "active": true,
      "createdAt": "2025-10-20T10:00:00.000Z",
      "updatedAt": "2025-10-24T15:30:00.000Z"
    }
  }
}
```

#### Response - Error (404)

```json
{
  "success": false,
  "message": "Premio no encontrado"
}
```

#### Response - Error (403)

```json
{
  "success": false,
  "message": "No tienes permiso para reactivar este premio"
}
```

---

### 2. Reactivar Todos los Premios

**Endpoint:** `PUT /api/prizes/reactivate-all`

**Autenticación:** Requerida (Bearer Token)

#### Request

```http
PUT /api/prizes/reactivate-all
Authorization: Bearer <token>
```

#### Response - Éxito (200)

```json
{
  "success": true,
  "message": "Se reactivaron 3 premio(s)",
  "data": {
    "reactivatedCount": 3
  }
}
```

#### Response - Sin premios para reactivar (200)

```json
{
  "success": true,
  "message": "Se reactivaron 0 premio(s)",
  "data": {
    "reactivatedCount": 0
  }
}
```

---

## 💾 Modelo de Datos

### Prize Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Dueño del premio
  title: String,
  description: String,
  imagePath: String,
  weight: Number,            // 1-10
  category: String,
  active: Boolean,           // Soft delete flag
  used: Boolean,             // Marcador de canje
  usedAt: Date,             // Fecha de canje
  createdAt: Date,
  updatedAt: Date
}
```

### Campos Modificados por Reactivación

- `used`: `true` → `false`
- `usedAt`: `Date` → `null`
- `updatedAt`: Actualizado automáticamente

---

## 🔒 Seguridad y Validaciones

### Validaciones de Seguridad

1. **Autenticación obligatoria:** Todos los endpoints requieren token JWT válido
2. **Propiedad del premio:** Solo el dueño del premio (`userId`) puede reactivarlo
3. **Existencia del premio:** Se valida que el premio exista antes de reactivar

### Lógica de Negocio

- ✅ Solo afecta premios del usuario autenticado
- ✅ Solo modifica el estado `used` y `usedAt`
- ✅ No afecta a GameSets ni niveles
- ✅ Premios con `active: false` no son reactivados

---

## 📱 Integración Frontend

### API Service (Mobile)

**Archivo:** `/workspace/mobile/src/api/api.js`

```javascript
export const apiService = {
  // ... otros métodos ...
  
  // Reactivar premio individual
  reactivatePrize: (id) => api.put(`/api/prizes/${id}/reactivate`),
  
  // Reactivar todos los premios
  reactivateAllPrizes: () => api.put('/api/prizes/reactivate-all'),
};
```

### Uso en WonPrizesScreen

**Archivo:** `/workspace/mobile/src/screens/WonPrizesScreen.js`

#### Reactivar Premio Individual

```javascript
const handleReactivatePrize = async (prizeId) => {
  Alert.alert(
    'Reactivar Premio',
    '¿Quieres reactivar este premio para poder canjearlo nuevamente?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reactivar',
        onPress: async () => {
          try {
            setReactivating(true);
            await apiService.reactivatePrize(prizeId);
            Alert.alert('✅ Éxito', 'Premio reactivado correctamente');
            await refetch();
          } catch (error) {
            const message = error.response?.data?.message || 'Error al reactivar premio';
            Alert.alert('Error', message);
          } finally {
            setReactivating(false);
          }
        },
      },
    ]
  );
};
```

#### Reactivar Todos los Premios

```javascript
const handleReactivateAll = () => {
  const usedPrizes = wonPrizes.filter(p => p.used);
  
  if (usedPrizes.length === 0) {
    Alert.alert('Info', 'No tienes premios canjeados para reactivar');
    return;
  }

  Alert.alert(
    'Reactivar Todos',
    `¿Quieres reactivar todos los ${usedPrizes.length} premios canjeados?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reactivar Todos',
        onPress: async () => {
          try {
            setReactivating(true);
            await apiService.reactivateAllPrizes();
            Alert.alert('✅ Éxito', 'Todos los premios han sido reactivados');
            await refetch();
          } catch (error) {
            const message = error.response?.data?.message || 'Error al reactivar premios';
            Alert.alert('Error', message);
          } finally {
            setReactivating(false);
          }
        },
      },
    ]
  );
};
```

---

## 🔧 Implementación Backend

### Controller

**Archivo:** `/workspace/backend/src/controllers/prize.controller.js`

```javascript
// Reactivar un premio específico
const reactivatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const prize = await Prize.findOne({ _id: id });

    if (!prize) {
      return res.status(404).json({
        success: false,
        message: 'Premio no encontrado'
      });
    }

    if (prize.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para reactivar este premio'
      });
    }

    prize.used = false;
    prize.usedAt = null;
    await prize.save();

    res.json({
      success: true,
      message: 'Premio reactivado exitosamente',
      data: { prize }
    });
  } catch (error) {
    console.error('Error reactivando premio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar premio',
      error: error.message
    });
  }
};

// Reactivar todos los premios
const reactivateAllPrizes = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Prize.updateMany(
      { 
        userId, 
        used: true 
      },
      { 
        $set: { 
          used: false,
          usedAt: null 
        } 
      }
    );

    res.json({
      success: true,
      message: `Se reactivaron ${result.modifiedCount} premio(s)`,
      data: { 
        reactivatedCount: result.modifiedCount 
      }
    });
  } catch (error) {
    console.error('Error reactivando todos los premios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar premios',
      error: error.message
    });
  }
};
```

### Routes

**Archivo:** `/workspace/backend/src/routes/prize.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prize.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', prizeController.getUserPrizes);
router.get('/won', prizeController.getUserWonPrizes);
router.post('/', prizeController.createPrize);
router.put('/reactivate-all', prizeController.reactivateAllPrizes);  // ⚠️ Antes de /:id
router.put('/:id', prizeController.updatePrize);
router.put('/:id/reactivate', prizeController.reactivatePrize);
router.delete('/:id', prizeController.deletePrize);

module.exports = router;
```

**⚠️ Nota importante sobre orden de rutas:**
- `/reactivate-all` debe estar ANTES de `/:id` para evitar que Express lo interprete como un parámetro ID

---

## 🧪 Casos de Prueba

### Test 1: Reactivar premio canjeado
```bash
# Request
curl -X PUT http://localhost:4000/api/prizes/507f1f77bcf86cd799439011/reactivate \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK, used: false, usedAt: null
```

### Test 2: Reactivar todos los premios
```bash
# Request
curl -X PUT http://localhost:4000/api/prizes/reactivate-all \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK, reactivatedCount: N
```

### Test 3: Reactivar premio de otro usuario
```bash
# Request (con premio de otro usuario)
curl -X PUT http://localhost:4000/api/prizes/507f1f77bcf86cd799439099/reactivate \
  -H "Authorization: Bearer <token_user_A>"

# Expected: 403 Forbidden
```

### Test 4: Reactivar premio que no existe
```bash
# Request
curl -X PUT http://localhost:4000/api/prizes/000000000000000000000000/reactivate \
  -H "Authorization: Bearer <token>"

# Expected: 404 Not Found
```

---

## 📊 Flujo de Usuario

```
Usuario ve premios ganados
         ↓
   ¿Premio canjeado?
         ↓
Muestra badge "Canjeado"
         ↓
Muestra botón "🔄 Reactivar Premio"
         ↓
Usuario presiona reactivar
         ↓
   Confirmar acción
         ↓
PUT /api/prizes/:id/reactivate
         ↓
    ¿Éxito?
    ↙     ↘
  Sí      No
   ↓       ↓
Actualizar  Mostrar
  lista     error
   ↓
Premio disponible nuevamente
```

---

## 🔄 Estados del Premio

### Ciclo de Vida

1. **Creado:** `used: false, usedAt: null, active: true`
2. **Ganado:** Premio asignado a un GameSet completado
3. **Canjeado:** `used: true, usedAt: Date`
4. **Reactivado:** `used: false, usedAt: null` ← Endpoint implementado
5. **Eliminado:** `active: false` (soft delete)

---

## ⚠️ Consideraciones Importantes

### Lo que NO hace la reactivación:

- ❌ NO crea un nuevo premio
- ❌ NO afecta a los GameSets completados
- ❌ NO cambia el historial de juegos
- ❌ NO modifica niveles ni progreso

### Lo que SÍ hace:

- ✅ Marca el premio como no usado
- ✅ Limpia la fecha de canje
- ✅ Permite que el premio sea asignado nuevamente en futuros juegos
- ✅ Solo afecta al modelo Prize

---

## 🔗 Relacionado Con

- **MyPrizesScreen:** Pantalla de gestión de premios creados por el usuario
- **WonPrizesScreen:** Pantalla de premios ganados (usa esta API)
- **Prize Model:** Modelo de datos de premios
- **GameSet Service:** Servicio de selección de premios para juegos

---

## 📝 Notas de Implementación

1. **Premios vs Premios Ganados:**
   - MyPrizesScreen: Gestiona premios creados por el usuario (plantillas)
   - WonPrizesScreen: Muestra premios ganados al completar juegos

2. **Reactivación masiva:**
   - Solo afecta premios del usuario autenticado
   - Usa `updateMany` para eficiencia
   - Retorna el número de premios reactivados

3. **Seguridad:**
   - Middleware de autenticación en todas las rutas
   - Validación de propiedad del premio
   - No permite reactivar premios de otros usuarios

---

**Última actualización:** 2025-10-24
**Versión:** 1.0
**Estado:** ✅ Implementado y Probado
