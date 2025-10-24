# Mobile Feature Gaps y Inconsistencias del Backend

Este documento registra las inconsistencias encontradas entre el backend y la aplicación móvil durante la implementación de la UI de resolución de niveles.

## Fecha de análisis
2025-10-24

## Gaps Detectados

### 1. ❌ CRÍTICO: Campo `imagePath` faltante en modelo Level

**Problema:**
- El modelo `Level` (`backend/src/models/Level.model.js`) NO tiene el campo `imagePath` definido en su schema
- El servicio `level.service.js` (línea 93) intenta asignar `imagePath: userData.imagePath || null`
- Mongoose con `strict: true` (default) ignora campos no definidos en el schema
- Resultado: Los niveles de tipo 'foto' se crean SIN el campo imagePath, haciendo imposible mostrar la imagen del puzzle

**Evidencia:**
```javascript
// backend/src/models/Level.model.js - NO TIENE imagePath
const levelSchema = new mongoose.Schema({
  gameSetId: {...},
  categoryId: {...},
  tipoDato: {...},
  // ... otros campos
  puzzleGrid: { type: Number, default: 3 },
  // ❌ FALTA: imagePath
}, { timestamps: true });

// backend/src/services/level.service.js - línea 93
const level = new Level({
  // ...
  imagePath: userData.imagePath || null,  // ⚠️ Este campo NO se guarda
  puzzleGrid: userData.puzzleGrid || 3,
  // ...
});
```

**Impacto:**
- Los niveles de tipo 'foto' (puzzle) no pueden mostrarse porque no tienen la ruta de la imagen
- El componente `ChallengeInput` muestra "No hay imagen disponible para este puzzle"
- Funcionalidad de puzzles COMPLETAMENTE ROTA

**Solución requerida en backend:**
```javascript
// Agregar al modelo Level:
imagePath: {
  type: String,
  default: null
}
```

**Workaround temporal implementado en móvil:**
- El componente `ChallengeInput` (línea 99-102) muestra un mensaje de error cuando no hay imagePath
- No hay forma de obtener la imagen sin modificar el backend o hacer un fetch adicional del UserData original (ineficiente)

---

## Funcionalidad Actual del Móvil

### ✅ Tipos soportados correctamente:
1. **texto**: Input de texto con normalización lowercase y trim
2. **fecha**: DateTimePicker con formato YYYY-MM-DD
3. **lugar**: Input de texto con placeholder específico para lugares

### ⚠️ Tipos con problemas:
4. **foto**: Implementado pero NO FUNCIONAL por falta de imagePath en Level

---

## Endpoints verificados

### POST `/api/game/level/:levelId/verify`
**Funciona correctamente** ✅

**Payload esperado:**
```javascript
// Para texto, fecha, lugar:
{ answer: "respuesta normalizada" }

// Para foto:
{ puzzleOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9] }  // Array de IDs en orden
```

**Respuesta exitosa:**
```javascript
{
  success: true,
  correct: true,
  message: "¡Respuesta correcta!",
  levelCompleted: true,
  gameCompleted: false,
  progress: 40
}
```

**Respuesta incorrecta:**
```javascript
{
  success: true,
  correct: false,
  message: "Respuesta incorrecta",
  attemptsLeft: 3,
  hint: "Pista revelada si está disponible"
}
```

---

## Recomendaciones

### Para el backend:
1. **URGENTE**: Agregar campo `imagePath` al modelo Level
2. Considerar agregar un populate de `tipoDato` en los endpoints que devuelven levels para incluir el `type` directamente
3. Verificar que todos los campos necesarios del UserData se copien correctamente al Level

### Para el móvil:
1. ✅ Implementado: Manejo de los 4 tipos de datos
2. ✅ Implementado: Validaciones y normalización de respuestas
3. ✅ Implementado: Componente PuzzleGame con tap-swap
4. ⚠️ Pendiente: Poder mostrar puzzles cuando se corrija el backend

---

## Archivos modificados en móvil

Ver `MOBILE_LEVEL_UI_CHANGELOG.md` para detalles completos de implementación.
