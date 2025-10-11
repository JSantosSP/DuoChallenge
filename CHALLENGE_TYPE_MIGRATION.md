# Migración de Tipos de Retos - Estandarización de Tipo "Texto"

## 📋 Resumen

Se ha estandarizado el sistema de tipos de retos para simplificar y normalizar la estructura, reduciendo los 5 tipos anteriores a 3 tipos principales bien definidos.

### Tipos Antiguos → Tipos Nuevos

| Tipo Anterior | Tipo Nuevo | Descripción |
|--------------|------------|-------------|
| `date_guess` | `date` | Retos de fechas |
| `riddle` | `text` | Acertijos → Reto de texto |
| `photo_puzzle` | `photo` | Retos visuales/fotos |
| `location` | `text` | Lugares → Reto de texto |
| `question` | `text` | Preguntas → Reto de texto |

### Nuevos Tipos Estandarizados

- **`text`**: Retos de entrada libre de texto (nombres, apodos, lugares, canciones, etc.)
  - Validación insensible a mayúsculas y espacios
  - Normalización automática (remove acentos, trim, lowercase)
  - Hash SHA256 para verificación segura
  
- **`date`**: Retos de fechas
  - Por ahora usa la misma validación que texto
  - Preparado para validaciones específicas de fecha en el futuro
  
- **`photo`**: Retos visuales/fotos
  - Por ahora usa validación de texto
  - Preparado para upload de imágenes en el futuro

## 🔧 Cambios Implementados

### 1. Backend - Modelos

**`backend/src/models/ChallengeTemplate.model.js`**
- ✅ Actualizado enum de `type` a: `['text', 'date', 'photo']`
- ✅ Agregado campo `answerExample` (opcional) para retos de texto

**`backend/src/models/Challenge.model.js`**
- ✅ Actualizado enum de `type` a: `['text', 'date', 'photo']`

### 2. Backend - Servicios

**`backend/src/services/challenge.service.js`**
- ✅ Actualizado mapeo de tipos en `createChallengeFromUserData()`:
  - `variable.type === 'date'` → `challengeType = 'date'`
  - `variable.type === 'image'` → `challengeType = 'photo'`
  - Otros tipos (text, location, number) → `challengeType = 'text'`

### 3. Backend - Controladores

**`backend/src/controllers/game.controller.js`**
- ✅ Implementado switch en `verifyChallenge()` para verificar según tipo:
  ```javascript
  switch (challenge.type) {
    case 'text':
      // Comparar texto normalizado
      isCorrect = verifyAnswer(answer, challenge.answerHash, challenge.salt);
      break;
    case 'date':
      // Preparado para validaciones específicas futuras
      isCorrect = verifyAnswer(answer, challenge.answerHash, challenge.salt);
      break;
    case 'photo':
      // Preparado para lógica futura (upload de imagen)
      isCorrect = verifyAnswer(answer, challenge.answerHash, challenge.salt);
      break;
  }
  ```

### 4. Mobile App

**`mobile/src/components/ChallengeInput.js`** (NUEVO)
- ✅ Componente genérico que renderiza input según tipo de reto
- ✅ Soporta tipos: `text`, `date`, `photo`
- ✅ Preparado para futuros inputs especializados

**`mobile/src/screens/ChallengeScreen.js`**
- ✅ Refactorizado para usar `<ChallengeInput />`
- ✅ Actualizado `getChallengeTypeLabel()` con nuevas etiquetas:
  - `text` → '✏️ Reto de Texto'
  - `date` → '📅 Adivina la Fecha'
  - `photo` → '🖼️ Reto Visual'

**`mobile/src/screens/LevelScreen.js`**
- ✅ Actualizado `getChallengeTypeLabel()` con nuevas etiquetas

### 5. Backoffice

**`backoffice/src/pages/Templates.jsx`**
- ✅ Actualizado select de tipo con nuevas opciones:
  - `text` → "Texto (nombres, apodos, lugares, canciones, etc.)"
  - `date` → "Fecha"
  - `photo` → "Foto"
- ✅ Agregado campo "Ejemplo de Respuesta" (opcional)
- ✅ Actualizada lógica de guardado para incluir `answerExample`

### 6. Seeds

**`backend/src/seeds/seed.js`**
- ✅ Actualizado todas las plantillas de retos con nuevos tipos

**`backend/src/seeds/migrateChallengeTypes.js`** (NUEVO)
- ✅ Script de migración para actualizar datos existentes en BD
- ✅ Migra automáticamente tipos antiguos a nuevos
- ✅ Muestra estadísticas de la migración

## 🚀 Migración de Datos Existentes

Para migrar los datos existentes en la base de datos, ejecutar:

```bash
cd backend
node src/seeds/migrateChallengeTypes.js
```

Este script:
1. Conecta a la base de datos
2. Actualiza todas las plantillas (ChallengeTemplate)
3. Actualiza todos los retos generados (Challenge)
4. Muestra un resumen de los cambios

## ✅ Resultado Esperado

Después de esta implementación:

1. **Sistema más simple y mantenible**
   - 3 tipos claros en lugar de 5
   - Lógica unificada para retos de texto
   
2. **Preparado para el futuro**
   - Switch preparado en verificación para agregar lógica específica
   - Componentes modulares en mobile app
   - Estructura clara para agregar nuevos tipos

3. **Sin cambios en funcionalidad actual**
   - Los retos de texto funcionan igual que antes
   - La validación normalizada se mantiene (insensible a mayúsculas/acentos)
   - El hash de seguridad se mantiene

4. **Mejor experiencia de usuario**
   - Etiquetas más claras en la UI
   - Campo de ejemplo de respuesta en backoffice
   - Componente input genérico reutilizable

## 🔍 Verificación

Para verificar que todo funciona correctamente:

1. **Backend**: Los endpoints deben funcionar sin cambios
   - `POST /api/game/verify/:challengeId` - Verificar respuesta
   - `GET /api/game/challenges/:challengeId` - Obtener reto

2. **Mobile App**: Los retos deben mostrarse y verificarse correctamente
   - Navegar a un nivel
   - Abrir un reto
   - Ingresar respuesta
   - Verificar que se valida correctamente

3. **Backoffice**: Crear/editar plantillas con nuevos tipos
   - Ir a Plantillas de Retos
   - Crear nueva plantilla con tipo "texto"
   - Agregar ejemplo de respuesta
   - Guardar y verificar

## 📝 Notas Técnicas

### Normalización de Respuestas

La función `verifyAnswer()` en `backend/src/utils/hash.util.js` continúa usando normalización:

```javascript
const canonicalizeAnswer = (answer) => {
  return answer
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Elimina acentos
};
```

### Hash de Seguridad

El sistema mantiene el hash SHA256 para verificación segura:
```
hash = SHA256(salt + canonicalized_answer)
```

Esto evita que las respuestas se almacenen en texto plano en la base de datos.

## 🎯 Próximos Pasos Sugeridos

1. **Validación específica de fechas**
   - Implementar parsing y validación de formatos de fecha
   - Permitir múltiples formatos (DD/MM/YYYY, YYYY-MM-DD, etc.)

2. **Upload de fotos**
   - Implementar subida de imágenes para retos tipo `photo`
   - Comparación visual o validación de metadata

3. **Tests**
   - Agregar tests unitarios para verificación de tipos
   - Tests de integración para flujo completo de retos

4. **Documentación de API**
   - Actualizar documentación con nuevos tipos
   - Ejemplos de uso para cada tipo
