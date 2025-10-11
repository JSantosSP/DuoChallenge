# Implementación de Retos de Tipo Fecha

## 📋 Resumen
Se ha implementado la lógica completa para los retos de tipo "fecha", tanto para cuando el usuario los crea (en su perfil de creador) como cuando el jugador los responde. Los datos y retos de tipo "fecha" ahora se introducen y responden usando un selector de calendario, no un campo de texto.

## ✅ Cambios Implementados

### 🧱 Backend

#### 1. Modelos (Ya soportaban el tipo 'date')
- ✅ `Challenge.model.js`: Ya tenía soporte para `type: 'date'`
- ✅ `Variable.model.js`: Ya tenía soporte para `type: 'date'`
- ✅ `UserData.model.js`: Soporta valores de fecha en el campo `valor`

#### 2. Utilidades de Hash (`src/utils/hash.util.js`)
**Nuevas funciones añadidas:**
- `normalizeDateAnswer(dateValue)`: Normaliza cualquier formato de fecha a YYYY-MM-DD
  - Soporta objetos Date
  - Soporta strings ISO (con hora)
  - Soporta formato YYYY-MM-DD
  - Parsea automáticamente formatos compatibles
  
- `hashDateAnswer(dateAnswer, salt)`: Genera hash de fecha normalizada
  - Normaliza la fecha antes de hashear
  - Garantiza consistencia independiente del formato de entrada
  
- `verifyDateAnswer(userAnswer, correctHash, salt)`: Verifica respuesta de fecha
  - Normaliza antes de comparar
  - Permite diferentes formatos de entrada que representen la misma fecha

**Lógica de normalización:**
```javascript
// Todos estos formatos son equivalentes para la fecha 2020-06-15:
- "2020-06-15"
- "2020-06-15T00:00:00.000Z"
- "2020-06-15T23:59:59.999Z"
- new Date("2020-06-15")
```

#### 3. Servicio de Retos (`src/services/challenge.service.js`)
**Cambios en funciones:**
- `createChallengeFromUserData()`: Usa `hashDateAnswer()` para retos tipo 'date'
- `createChallengeFromTemplate()`: Usa `hashDateAnswer()` para retos tipo 'date'
- `createCustomChallenge()`: Usa `hashDateAnswer()` para retos tipo 'date'

**Lógica:**
```javascript
if (challengeType === 'date') {
  answerHash = hashDateAnswer(userData.valor, salt);
} else {
  answerHash = hashAnswer(userData.valor, salt);
}
```

#### 4. Controlador de Juego (`src/controllers/game.controller.js`)
**Cambios en `verifyChallenge()`:**
```javascript
case 'date':
  // Para retos de fecha: normalizar a formato YYYY-MM-DD y comparar
  isCorrect = verifyDateAnswer(answer, challenge.answerHash, challenge.salt);
  break;
```

### 📱 App Móvil

#### 1. Componente ChallengeInput (`src/components/ChallengeInput.js`)
**Implementación completa de DatePicker:**
- Usa `@react-native-community/datetimepicker`
- Muestra un botón elegante con icono de calendario 📅
- Al presionar, abre el selector nativo de fecha
- Formatea la fecha para mostrar en español (ej: "15 de junio de 2020")
- Envía al backend en formato YYYY-MM-DD
- **No permite entrada manual de texto**
- Comportamiento específico por plataforma:
  - **iOS**: Muestra spinner con botón "Confirmar"
  - **Android**: Muestra diálogo modal nativo

**Características:**
- Fecha máxima: Hoy (no permite fechas futuras)
- Locale: es-ES (español)
- Formato interno: YYYY-MM-DD
- Formato visual: "15 de junio de 2020"

#### 2. Pantalla de Edición de Datos (`src/screens/EditDataScreen.js`)
**Nuevas funcionalidades:**
- Detecta cuando `selectedType.type === 'date'`
- Muestra DatePicker en lugar de TextInput
- Permite seleccionar fecha con calendario
- Inicializa correctamente al editar datos existentes
- Formatea y envía en formato YYYY-MM-DD
- **No permite entrada manual de texto**

**Handlers añadidos:**
- `handleDateChange()`: Maneja cambios en el DatePicker
- `formatDateDisplay()`: Formatea fecha para visualización

#### 3. Dependencias (`mobile/package.json`)
**Nueva dependencia añadida:**
```json
"@react-native-community/datetimepicker": "^8.2.0"
```

### 🖥️ Backoffice

#### Plantillas de Retos (`src/pages/Templates.jsx`)
**Mejoras en el formulario:**
- Campo de "Ejemplo de Respuesta" se deshabilita automáticamente para tipo 'date'
- Muestra información contextual cuando se selecciona tipo 'date':
  ```
  📅 Retos de tipo fecha:
  • El jugador elegirá la fecha usando un selector de calendario
  • No se permite entrada manual de texto
  • El formato esperado por el backend es YYYY-MM-DD
  • Ejemplo de respuesta correcta: 2020-06-15
  ```
- Usa `watch('type')` para reactividad en tiempo real

## 🧪 Tests Realizados

### Backend
✅ **Test de normalización de fechas:**
- Formatos ISO completos → YYYY-MM-DD ✓
- Formato YYYY-MM-DD → YYYY-MM-DD ✓
- Objetos Date → YYYY-MM-DD ✓

✅ **Test de verificación de hash:**
- Todos los formatos de la misma fecha validan correctamente ✓
- Fechas diferentes se rechazan correctamente ✓

✅ **Verificación de sintaxis:**
- `hash.util.js` ✓
- `challenge.service.js` ✓
- `game.controller.js` ✓

## 📦 Instalación de Dependencias

Para que la app móvil funcione correctamente, ejecutar:

```bash
cd mobile
npm install @react-native-community/datetimepicker@^8.2.0
# o
yarn add @react-native-community/datetimepicker@^8.2.0
```

## 🔄 Flujo Completo

### Creación de Dato de Fecha (Creador)
1. Usuario selecciona tipo de dato que es tipo 'date' (ej: "primera_cita")
2. Se muestra DatePicker en lugar de TextInput
3. Usuario selecciona fecha del calendario
4. App formatea a YYYY-MM-DD y envía al backend
5. Backend normaliza y hashea con `hashDateAnswer()`

### Generación de Reto
1. Backend obtiene dato tipo 'date' del creador
2. Detecta que es tipo 'date' por el Variable.type
3. Genera hash usando `hashDateAnswer()` que normaliza automáticamente
4. Guarda Challenge con type='date'

### Respuesta de Reto (Jugador)
1. App detecta challenge.type === 'date'
2. Muestra DatePicker en ChallengeInput
3. Usuario selecciona fecha
4. App envía en formato YYYY-MM-DD
5. Backend verifica con `verifyDateAnswer()` que:
   - Normaliza la respuesta del usuario
   - Compara con hash normalizado
   - Retorna si es correcta o no

## 🎯 Resultado Final

✅ **Los datos de tipo fecha se crean mediante calendario**
- No hay posibilidad de escribir manualmente
- Interfaz intuitiva con icono 📅
- Formato consistente YYYY-MM-DD

✅ **Los retos de fecha se resuelven con calendario**
- Misma experiencia de usuario
- No permite entrada de texto
- Validación robusta en backend

✅ **Backend valida correctamente el formato**
- Normalización automática
- Soporte para múltiples formatos de entrada
- Hash consistente independiente del formato

✅ **Backoffice proporciona información clara**
- Indica cómo funcionan los retos de fecha
- Deshabilita campos no relevantes
- Documentación en contexto

## 📝 Notas Técnicas

### Consideraciones de Zona Horaria
La normalización usa `toISOString().split('T')[0]` que convierte a UTC y toma solo la parte de fecha (YYYY-MM-DD), evitando problemas de zona horaria.

### Compatibilidad
- **iOS**: DatePicker modal con estilo spinner
- **Android**: DatePicker nativo del sistema
- **Backend**: Agnóstico de formato, normaliza todo a YYYY-MM-DD

### Seguridad
- Los hashes se generan con normalización consistente
- No se pueden enviar fechas con formato inconsistente que rompan la validación
- Salt único por cada reto

## 🚀 Próximos Pasos

Si se requieren mejoras futuras:
1. Permitir configurar fecha máxima/mínima personalizada por reto
2. Agregar validaciones específicas (ej: fecha debe ser en el pasado)
3. Soporte para rangos de fechas
4. Agregar formato de fecha configurable por locale del usuario

---
**Fecha de implementación:** 2025-10-11
**Autor:** Cursor AI Background Agent
