# Implementación de Retos de Puzzle de Fotos

## Resumen
Se ha implementado exitosamente el nuevo tipo de reto "photo", que permite a los creadores subir imágenes que se convierten en puzzles interactivos para los jugadores.

## Cambios Realizados

### 🧱 Backend

#### 1. Modelos Actualizados

**Challenge.model.js**
- ✅ Agregado campo `puzzleGrid` (número de 2 a 5, por defecto 3)
- ✅ El tipo 'photo' ya existía en el enum

**UserData.model.js**
- ✅ Agregado campo `puzzleGrid` para almacenar la dificultad del puzzle
- ✅ Soporte para `imagePath` y `puzzleGrid`

#### 2. Servicios y Utilidades

**challenge.service.js**
- ✅ Actualizado `createChallengeFromUserData` para pasar `puzzleGrid` al crear challenges
- ✅ Lógica para generar hash de puzzle usando `hashPuzzleAnswer`

**hash.util.js**
- ✅ Nueva función `hashPuzzleAnswer(puzzleGrid, salt)` - genera hash para orden correcto [1,2,3,...]
- ✅ Nueva función `verifyPuzzleAnswer(userOrder, correctHash, salt)` - verifica orden del puzzle

#### 3. Controladores

**game.controller.js**
- ✅ Actualizado endpoint `/api/challenge/:id/verify` para aceptar `puzzleOrder` en el body
- ✅ Validación específica para tipo 'photo' usando `verifyPuzzleAnswer`
- ✅ Retorna error si puzzleOrder no es un array válido

### 📱 App Móvil

#### 1. Componente de Puzzle

**PuzzleGame.js** (NUEVO)
- ✅ Componente interactivo que divide imagen en grid NxN
- ✅ Permite tap-swap entre piezas para reordenarlas
- ✅ Verifica automáticamente cuando el puzzle está completo
- ✅ Callback `onComplete(order)` que devuelve el orden final
- ✅ Botón de reiniciar puzzle
- ✅ Instrucciones visuales para el jugador
- ✅ Soporte para grids de 2x2 hasta 5x5

**Características del Puzzle:**
- Algoritmo Fisher-Yates para desordenar piezas
- Recorte preciso de imagen usando coordenadas
- Animación visual al seleccionar pieza (borde destacado)
- Validación que asegura al menos una pieza fuera de lugar al inicio

#### 2. Componentes Actualizados

**ChallengeInput.js**
- ✅ Renderiza `PuzzleGame` cuando `type === 'photo'`
- ✅ Acepta prop `challenge` para obtener `imagePath` y `puzzleGrid`
- ✅ Prop `onPuzzleComplete` para manejar completación
- ✅ Fallback si no hay imagen disponible

**ChallengeScreen.js**
- ✅ Manejo de estado `puzzleOrder` para puzzles
- ✅ Función `handlePuzzleComplete` que envía verificación automática
- ✅ Oculta botón "Verificar" para tipo photo (verificación automática)
- ✅ No muestra imagen separada para puzzles (ya está en el componente)
- ✅ Payload diferente según tipo: `{ answer }` o `{ puzzleOrder }`

**EditDataScreen.js**
- ✅ Campo `puzzleGrid` en formData (por defecto 3)
- ✅ Selector visual de dificultad (2x2, 3x3, 4x4, 5x5)
- ✅ Muestra número de piezas para cada opción
- ✅ Solo visible cuando `selectedType.type === 'image'`
- ✅ Texto explicativo sobre puzzle interactivo
- ✅ Guardado de `puzzleGrid` junto con imagen

#### 3. API y Hooks

**api.js**
- ✅ Actualizado `verifyChallenge` para aceptar payload genérico

**useGame.js**
- ✅ Actualizado `verifyMutation` para usar `{ challengeId, payload }`

### 🖥️ Backoffice

**Templates.jsx**
- ✅ Descripción detallada para tipo 'photo'
- ✅ Explicación sobre funcionamiento del puzzle
- ✅ Información sobre grid sizes disponibles
- ✅ Nota sobre gestión de imágenes desde app móvil

## Flujo de Funcionamiento

### Para el Creador:
1. Usuario va a "Mis Datos" → "Agregar Dato"
2. Selecciona un tipo de dato con `type: 'image'` (ej: "foto_memorable")
3. Ingresa pregunta: "¿Qué lugar es este?"
4. Sube una imagen desde galería
5. Selecciona dificultad del puzzle (2x2 a 5x5)
6. Guarda el dato

### Para el Jugador:
1. Al generar juego, se crean challenges con `type: 'photo'`
2. En la pantalla del reto, ve el puzzle desordenado
3. Toca dos piezas para intercambiarlas
4. Puede reiniciar el puzzle si se equivoca
5. Al completar correctamente, recibe notificación y verificación automática
6. El sistema valida que el orden sea [1,2,3,4,...,N]

## Verificación del Puzzle

### Generación de Hash:
```javascript
// Orden correcto siempre es [1,2,3,4,5,6,7,8,9] para 3x3
const correctOrder = [1,2,3,4,5,6,7,8,9];
const puzzleString = correctOrder.join(','); // "1,2,3,4,5,6,7,8,9"
const hash = SHA256(salt + puzzleString);
```

### Verificación:
```javascript
// Usuario envía: { puzzleOrder: [1,2,3,4,5,6,7,8,9] }
const userString = puzzleOrder.join(',');
const userHash = SHA256(salt + userString);
const isCorrect = userHash === storedHash;
```

## Archivos Modificados

### Backend:
- ✅ `backend/src/models/Challenge.model.js`
- ✅ `backend/src/models/UserData.model.js`
- ✅ `backend/src/services/challenge.service.js`
- ✅ `backend/src/utils/hash.util.js`
- ✅ `backend/src/controllers/game.controller.js`

### Mobile:
- ✅ `mobile/src/components/PuzzleGame.js` (NUEVO)
- ✅ `mobile/src/components/ChallengeInput.js`
- ✅ `mobile/src/screens/ChallengeScreen.js`
- ✅ `mobile/src/screens/EditDataScreen.js`
- ✅ `mobile/src/api/api.js`
- ✅ `mobile/src/hooks/useGame.js`

### Backoffice:
- ✅ `backoffice/src/pages/Templates.jsx`

## Documentación:
- ✅ `IMPLEMENTACION_PUZZLE_FOTOS.md` (ESTE ARCHIVO)

## Características Implementadas

✅ **Backend valida orden del puzzle**
- Endpoint acepta `puzzleOrder` array
- Verifica orden correcto [1,2,3,...,N]
- Usa hash SHA256 para seguridad

✅ **Grid configurable**
- Soporte para 2x2, 3x3, 4x4, 5x5
- Mayor grid = mayor dificultad
- Almacenado en UserData y Challenge

✅ **Interfaz móvil intuitiva**
- Tap-swap para intercambiar piezas
- Visual feedback al seleccionar
- Verificación automática al completar
- Botón de reiniciar

✅ **Creador puede configurar**
- Subir imagen personalizada
- Elegir dificultad del puzzle
- Vista previa de imagen
- Validaciones de campos requeridos

✅ **Sistema extensible**
- Fácil agregar nuevos tamaños de grid
- Lógica reutilizable para otros tipos de puzzles
- API genérica para verificación

## Próximos Pasos Sugeridos (Opcional)

- [ ] Agregar animación al completar puzzle exitosamente
- [ ] Permitir drag & drop además de tap-swap
- [ ] Mostrar preview de imagen completa (opcional)
- [ ] Timer para completar puzzle
- [ ] Contador de movimientos realizados
- [ ] Efectos de sonido al intercambiar piezas
- [ ] Modo ayuda que muestra números en las piezas

## Notas Técnicas

- Las imágenes se almacenan en `/uploads` en el backend
- El puzzle NO se divide físicamente, solo visualmente en el cliente
- `puzzleGrid` almacena el tamaño de la cuadrícula (no el número de piezas)
- Número de piezas = puzzleGrid × puzzleGrid
- El orden correcto siempre empieza en 1 (no en 0)

## Testing

Para probar la funcionalidad:

1. **Backend**: El servidor debe estar corriendo con MongoDB
2. **Mobile**: 
   - Crear un dato con tipo 'image'
   - Subir una imagen
   - Seleccionar grid size
   - Generar juego
   - Completar puzzle y verificar respuesta
3. **Backoffice**: Ver información del tipo 'photo' en Templates

---

✨ **Implementación completada exitosamente**
