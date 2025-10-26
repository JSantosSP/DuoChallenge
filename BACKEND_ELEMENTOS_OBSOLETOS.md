# 🔍 Elementos Obsoletos o a Revisar - Backend DuoChallenge

> **Fecha de análisis:** 2025-10-26  
> **Versión del sistema:** 1.0.0

Este documento identifica elementos del código que podrían estar obsoletos, duplicados o requieren revisión para mejorar la calidad y mantenibilidad del backend.

---

## 📋 Tabla de Contenidos

1. [Código Legacy o No Utilizado](#código-legacy-o-no-utilizado)
2. [Duplicaciones](#duplicaciones)
3. [Inconsistencias](#inconsistencias)
4. [Posibles Bugs](#posibles-bugs)
5. [Mejoras Recomendadas](#mejoras-recomendadas)

---

## 🗑️ Código Legacy o No Utilizado

### 1. Campo `roles` en User.model.js

**Archivo:** `/backend/src/models/User.model.js`

**Líneas:** 37-39

```javascript
if (!this.roles || this.roles.length === 0) {
  this.roles = [this.role];
}
```

**Problema:**
- El schema de User **no define** un campo `roles` (array)
- Solo existe `role` (string)
- Este código asigna a una propiedad que no existe en el modelo

**Impacto:** Bajo (no causa errores, pero es código inútil)

**Recomendación:**
```javascript
// ELIMINAR estas líneas 37-39
// O si se quiere implementar roles múltiples, agregar al schema:
roles: [{
  type: String,
  enum: ['admin', 'player']
}]
```

---

### 2. Método `hasRole()` sin uso

**Archivo:** `/backend/src/models/User.model.js`

**Líneas:** 59-61

```javascript
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};
```

**Problema:**
- Depende del campo `roles` que no existe
- **No se usa en ningún lugar del código**

**Búsqueda realizada:** `hasRole` no aparece en controllers, routes o middlewares

**Recomendación:**
```javascript
// ELIMINAR método hasRole()
// O reemplazar por:
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};
```

---

### 3. Índices innecesarios en PrizeTemplate

**Archivo:** `/backend/src/models/PrizeTemplate.model.js`

**Líneas:** 31-32

```javascript
prizeTemplateSchema.index({ userId: 1, active: 1 });
prizeTemplateSchema.index({ isDefault: 1, active: 1 });
```

**Problema:**
- PrizeTemplate **no tiene campo `userId`** (son plantillas globales)
- PrizeTemplate **no tiene campo `isDefault`**
- Estos índices se crean pero nunca se usan

**Impacto:** Bajo (MongoDB simplemente no los usa)

**Recomendación:**
```javascript
// ELIMINAR ambos índices
// O definir los campos en el schema si se van a usar en el futuro
```

---

### 4. Referencia a modelo `Challenge` inexistente

**Archivo:** `/backend/src/services/gameset.service.js`

**Línea:** 1

```javascript
const { GameSet, User, Challenge, Level } = require('../models');
```

**Problema:**
- Se importa `Challenge` pero **no existe** en `/models`
- No se usa en el código del servicio

**Impacto:** Ninguno (no se usa)

**Recomendación:**
```javascript
// Cambiar a:
const { GameSet, User, Level } = require('../models');
```

---

## 🔄 Duplicaciones

### 1. Lógica de upload de imágenes duplicada

**Ubicaciones:**
1. **server.js** (línea 59-87)
2. **admin.controller.js** (línea 159-187)

**Código duplicado:**

```javascript
// Mismo código en ambos archivos:
app.post('/api/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ningún archivo' 
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${imagePath}`;

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        path: imagePath,
        fullUrl: fullUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

**Impacto:** Medio (mantenimiento duplicado)

**Recomendación:**
```javascript
// Opción 1: Eliminar de server.js, dejar solo en admin
// Opción 2: Crear un controlador compartido
// Opción 3: Usar el mismo endpoint /admin/upload para todos
```

---

### 2. Rutas duplicadas para el mismo recurso

**Archivo:** `/backend/server.js`

**Líneas:** 89-91

```javascript
app.use('/api', gameRoutes);
app.use('/api/game', gameRoutes);
```

**Problema:**
- El mismo router `gameRoutes` se monta en **dos rutas diferentes**
- Causa confusión: ¿usar `/api/generate` o `/api/game/generate`?
- Ambos funcionan pero es inconsistente

**Impacto:** Bajo (funciona pero inconsistente)

**Recomendación:**
```javascript
// ELEGIR UNA sola ruta:
app.use('/api/game', gameRoutes);
// Y actualizar clientes para usar solo /api/game/*
```

---

### 3. Validación de fecha duplicada

**Archivo:** `/backend/src/controllers/userdata.controller.js`

**Líneas:** 37-44

```javascript
if (variable.type === 'date') {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(valor)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de fecha inválido. Use YYYY-MM-DD'
    });
  }
}
```

**Problema:**
- Esta validación también existe en `hash.util.js` como `normalizeDateAnswer()`
- Se debería centralizar

**Recomendación:**
```javascript
// Usar la función de utils:
const { normalizeDateAnswer } = require('../utils/hash.util');

// Validar:
try {
  const normalized = normalizeDateAnswer(valor);
  if (!normalized) throw new Error('Fecha inválida');
} catch (error) {
  return res.status(400).json({
    success: false,
    message: 'Formato de fecha inválido. Use YYYY-MM-DD'
  });
}
```

---

## ⚠️ Inconsistencias

### 1. Campos `currentSetId` y `currentPrizeId` no existen en User

**Archivos afectados:**
- `/backend/src/controllers/auth.controller.js` (línea 147-149)
- `/backend/src/controllers/admin.controller.js` (línea 117-120)

**Código:**
```javascript
const user = await User.findById(req.user._id)
  .populate('currentSetId')
  .populate('currentPrizeId');
```

**Problema:**
- User.model **no define** `currentSetId` ni `currentPrizeId`
- Estos `.populate()` no tienen efecto
- Mongoose no arroja error pero no popula nada

**Impacto:** Medio (funcionalidad esperada no funciona)

**Recomendación:**
```javascript
// Opción 1: Agregar campos al User schema
currentSetId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'GameSet'
},
currentPrizeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Prize'
}

// Opción 2: Eliminar los .populate() si no se usan
const user = await User.findById(req.user._id);
```

---

### 2. Inconsistencia en nombres de campos

**Problema:** Algunos modelos usan español, otros no

| Modelo | Campo | Debería ser |
|--------|-------|-------------|
| UserData | `categorias` | `categoryId` o `categories` |
| Level | `tipoDato` | `dataType` o `variableId` |

**Impacto:** Bajo (funciona pero es inconsistente)

**Recomendación:**
- Estandarizar todo en inglés
- O todo en español
- **No mezclar**

---

### 3. Soft delete inconsistente

**Problema:**
- Algunos modelos usan `active: false` para soft delete
- Otros eliminan directamente de la DB

**Ejemplos:**

✅ **Soft delete correcto:**
- UserData
- Prize
- GameSet (con campo `active`)

❌ **Hard delete:**
- Category (línea 90 en controller)
- Variable (línea 55 en admin controller)

**Recomendación:**
```javascript
// Cambiar todos a soft delete:
const deleteCategory = async (req, res) => {
  const category = await Category.findById(id);
  category.active = false;
  await category.save();
};
```

---

## 🐛 Posibles Bugs

### 1. Race condition en generación de código compartido

**Archivo:** `/backend/src/controllers/share.controller.js`

**Líneas:** 30-35

```javascript
let code;
let exists = true;
while (exists) {
  code = generateShareCode();
  exists = await GameShare.findOne({ code });
}
```

**Problema:**
- En alta concurrencia, dos requests podrían generar el mismo código
- Aunque `code` es `unique`, causaría error en `.save()`

**Impacto:** Bajo (probabilidad muy baja con códigos de 6 caracteres)

**Recomendación:**
```javascript
// Agregar retry con try-catch:
let attempts = 0;
const maxAttempts = 5;

while (attempts < maxAttempts) {
  try {
    code = generateShareCode();
    const gameShare = new GameShare({ creatorId, code, active: true });
    await gameShare.save();
    break;
  } catch (error) {
    if (error.code === 11000) { // Duplicate key
      attempts++;
      continue;
    }
    throw error;
  }
}
```

---

### 2. No se valida que el usuario tenga premios antes de completar

**Archivo:** `/backend/src/services/prize.service.js`

**Líneas:** 4-12

```javascript
const availablePrizes = await Prize.find({ 
  userId, active: true, used: false
});

if (availablePrizes.length === 0) {
  throw new Error('No hay premios disponibles');
}
```

**Problema:**
- Si el usuario completa todos los niveles pero **no tiene premios**, el juego falla
- El error no se maneja bien en el cliente

**Impacto:** Alto (mala UX)

**Recomendación:**
```javascript
// Validar al generar el juego:
const generateGame = async (req, res) => {
  const userId = req.user._id;
  
  // Verificar que tenga premios
  const prizeCount = await Prize.countDocuments({ 
    userId, active: true, used: false 
  });
  
  if (prizeCount === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debes crear al menos un premio antes de jugar'
    });
  }
  
  // Continuar...
};
```

---

### 3. Campo `completedLevels` en User no existe pero se usa

**Archivo:** `/backend/src/controllers/admin.controller.js`

**Línea:** 133

```javascript
.populate('completedLevels');
```

**Problema:**
- User.model **no tiene** campo `completedLevels`
- Este `.populate()` no hace nada

**Impacto:** Bajo (no causa error pero no funciona)

**Recomendación:**
```javascript
// Eliminar el .populate('completedLevels')
const user = await User.findById(id)
  .populate('currentSetId')
  .populate('currentPrizeId');
```

---

## 🔧 Mejoras Recomendadas

### 1. Centralizar respuestas HTTP

**Problema:** Cada controlador define su propio formato de respuesta

**Solución:**
```javascript
// utils/response.util.js
module.exports = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },
  
  error: (res, message, statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  }
};

// Uso:
const { success, error } = require('../utils/response.util');

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return success(res, { users });
  } catch (err) {
    return error(res, err.message);
  }
};
```

---

### 2. Validación de inputs centralizada

**Problema:** Validaciones esparcidas en controllers

**Solución:**
```javascript
// Usar express-validator
const { body, validationResult } = require('express-validator');

// routes/auth.routes.js
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty()
], authController.register);

// controller
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
};
```

---

### 3. Consistencia en nombres de variables

**Problema:** Mezcla de inglés y español

**Ejemplos inconsistentes:**
- `tipoDato` vs `dataType`
- `categorias` vs `category`
- `pistas` vs `hints`

**Recomendación:**
- Migrar todo a **inglés** (estándar en desarrollo)
- O mantener **español** si es preferencia del equipo
- **NO MEZCLAR**

---

### 4. Agregar campo `deletedAt` para soft deletes

**Problema:** Se usa `active: false` pero no se sabe cuándo fue eliminado

**Solución:**
```javascript
// En todos los schemas:
deletedAt: {
  type: Date,
  default: null
}

// Al eliminar:
item.active = false;
item.deletedAt = new Date();
await item.save();

// Queries:
const activeItems = await Model.find({ 
  active: true, 
  deletedAt: null 
});
```

---

### 5. Implementar enums compartidos

**Problema:** Enums duplicados en múltiples archivos

**Solución:**
```javascript
// constants/enums.js
module.exports = {
  USER_ROLES: {
    ADMIN: 'admin',
    PLAYER: 'player'
  },
  
  GAME_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned'
  },
  
  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  },
  
  DATA_TYPES: {
    PHOTO: 'foto',
    DATE: 'fecha',
    PLACE: 'lugar',
    TEXT: 'texto'
  }
};

// Uso:
const { USER_ROLES } = require('../constants/enums');

role: {
  type: String,
  enum: Object.values(USER_ROLES),
  default: USER_ROLES.PLAYER
}
```

---

## 📊 Resumen de Elementos Obsoletos

| Categoría | Cantidad | Prioridad |
|-----------|----------|-----------|
| Código no usado | 4 | Baja |
| Duplicaciones | 3 | Media |
| Inconsistencias | 3 | Media |
| Posibles bugs | 3 | Alta |
| Mejoras sugeridas | 5 | Media |

---

## ✅ Checklist de Limpieza

### Prioridad Alta
- [ ] Agregar validación de premios antes de generar juego
- [ ] Corregir race condition en generación de códigos
- [ ] Decidir qué hacer con campos `currentSetId` y `currentPrizeId`

### Prioridad Media
- [ ] Eliminar duplicación de lógica de upload
- [ ] Consolidar rutas `/api` y `/api/game`
- [ ] Estandarizar nombres (inglés vs español)
- [ ] Implementar soft delete consistente

### Prioridad Baja
- [ ] Eliminar código legacy de `roles` y `hasRole()`
- [ ] Eliminar índices innecesarios en PrizeTemplate
- [ ] Eliminar import de `Challenge` inexistente
- [ ] Limpiar `.populate()` que no funcionan

---

## 📝 Notas Finales

Este documento debe actualizarse conforme se limpie el código. Marcar los items completados y agregar nuevos elementos detectados durante el mantenimiento.

**Última actualización:** 2025-10-26

---

## 🔗 Referencias

- [BACKEND_DOCUMENTATION.md](/workspace/BACKEND_DOCUMENTATION.md) - Documentación completa del sistema
- Código fuente con comentarios JSDoc actualizados

---

**Documento generado automáticamente por análisis de código**
