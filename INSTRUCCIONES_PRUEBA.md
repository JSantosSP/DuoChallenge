# 🧪 Instrucciones para Probar la Implementación

Esta guía te ayudará a probar la implementación de la UI de resolución de niveles en la aplicación móvil.

---

## 📋 Pre-requisitos

1. ✅ Backend corriendo en el puerto configurado
2. ✅ Base de datos con datos de prueba (users, userData, categories, variables)
3. ✅ Usuario creado con UserData de los 4 tipos (texto, fecha, lugar, foto)
4. ✅ Premios creados para el usuario
5. ✅ App móvil instalada en dispositivo/emulador

---

## 🚀 Flujo de Prueba Completo

### 1. Preparación de Datos

**En el backend:**

```bash
# Ejecutar seed si no hay datos
cd backend
npm run seed
```

**Crear UserData de prueba (desde backoffice o API):**

```json
// Tipo texto
{
  "tipoDato": "<id_variable_texto>",
  "valor": { "texto": "paris" },
  "pregunta": "¿Cuál es la capital de Francia?",
  "pistas": ["Está en Europa", "Es famosa por la Torre Eiffel", "Ciudad del amor"],
  "categorias": "<id_categoria>",
  "difficulty": "easy"
}

// Tipo lugar
{
  "tipoDato": "<id_variable_lugar>",
  "valor": { "lugar": "barcelona" },
  "pregunta": "¿En qué ciudad nací?",
  "pistas": ["Está en España", "Tiene playa", "Capital de Cataluña"],
  "categorias": "<id_categoria>",
  "difficulty": "medium"
}

// Tipo fecha
{
  "tipoDato": "<id_variable_fecha>",
  "valor": { "fecha": "2020-05-15" },
  "pregunta": "¿Cuándo nos conocimos?",
  "pistas": ["Fue en primavera", "Año de la pandemia", "Mayo"],
  "categorias": "<id_categoria>",
  "difficulty": "medium"
}

// Tipo foto (CON imagePath)
{
  "tipoDato": "<id_variable_foto>",
  "valor": { "foto": "/uploads/ejemplo.jpg" },
  "imagePath": "/uploads/ejemplo.jpg",  // ⚠️ IMPORTANTE
  "pregunta": "¿Qué lugar es este?",
  "pistas": ["Es un lugar especial", "Fuimos juntos", "Tiene mucho verde"],
  "categorias": "<id_categoria>",
  "puzzleGrid": 3,
  "difficulty": "hard"
}
```

**Nota crítica:** El tipo foto NO funcionará hasta que se corrija el bug del backend (ver MOBILE_FEATURE_GAPS.md)

---

### 2. Generar Juego

**Desde la app móvil:**

1. Login con usuario de prueba
2. Navega a la pantalla principal
3. Toca "Generar Nuevo Juego"
4. Verifica que se crean 5 niveles
5. El juego debe estar en estado "active"

**Verificación:**
- ✅ Se muestra lista de niveles
- ✅ Cada nivel tiene su tipo de dato correspondiente
- ✅ Barra de progreso en 0%

---

### 3. Probar Tipo: TEXTO

1. Abre un nivel de tipo "texto"
2. **Verifica UI:**
   - ✅ Se muestra la pregunta
   - ✅ Se muestra "Tu respuesta:" como label
   - ✅ Input de texto visible
   - ✅ Placeholder: "Tu respuesta..."
   - ✅ Botón "Verificar Respuesta" visible
   - ✅ Contador de intentos: 0 / 5

3. **Prueba respuesta incorrecta:**
   - Escribe una respuesta incorrecta (ej: "madrid")
   - Toca "Verificar Respuesta"
   - **Esperar:** Alert "Intenta de nuevo 💭" con mensaje del backend
   - **Esperar:** Primera pista revelada
   - **Esperar:** Contador actualizado: 1 / 5

4. **Prueba respuesta correcta:**
   - Escribe la respuesta correcta (ej: "paris" o "PARIS" o "Paris")
   - Toca "Verificar Respuesta"
   - **Esperar:** Alert "✅ ¡Nivel Completado!"
   - **Esperar:** Navegación automática de vuelta
   - **Esperar:** Nivel marcado como completado
   - **Esperar:** Progreso actualizado (ej: 20%)

---

### 4. Probar Tipo: LUGAR

1. Abre un nivel de tipo "lugar"
2. **Verifica UI:**
   - ✅ Se muestra la pregunta
   - ✅ Se muestra "Lugar:" como label
   - ✅ Input de texto visible
   - ✅ Placeholder: "Ej: Madrid, Parque del Retiro, Casa..."
   - ✅ Botón "Verificar Respuesta" visible

3. **Prueba normalización:**
   - Escribe "Barcelona" (con mayúscula)
   - Toca "Verificar Respuesta"
   - **Esperar:** Se normaliza a "barcelona" automáticamente
   - **Esperar:** Respuesta correcta si coincide

4. **Verificar comportamiento igual que texto**

---

### 5. Probar Tipo: FECHA

1. Abre un nivel de tipo "fecha"
2. **Verifica UI:**
   - ✅ Se muestra la pregunta
   - ✅ Se muestra "Fecha:" como label
   - ✅ Botón con calendario visible (no input de texto)
   - ✅ Texto inicial: "Seleccionar fecha"
   - ✅ Icono 📅 visible

3. **Prueba selector de fecha:**
   - Toca el botón de fecha
   - **iOS:** Se abre picker tipo spinner
   - **Android:** Se abre picker nativo
   - Selecciona una fecha incorrecta (ej: 2020-05-01)
   - **iOS:** Toca "Confirmar"
   - Verifica que se muestra la fecha formateada (ej: "1 de mayo de 2020")
   - Toca "Verificar Respuesta"
   - **Esperar:** Alert de respuesta incorrecta

4. **Prueba fecha correcta:**
   - Toca el botón de fecha
   - Selecciona la fecha correcta (2020-05-15)
   - Toca "Verificar Respuesta"
   - **Esperar:** Alert "✅ ¡Nivel Completado!"

---

### 6. Probar Tipo: FOTO (Puzzle)

**⚠️ NOTA CRÍTICA:** Este tipo NO funcionará hasta que se corrija el bug del backend.

**Si el bug está corregido:**

1. Abre un nivel de tipo "foto"
2. **Verifica UI:**
   - ✅ Se muestra la pregunta
   - ✅ NO se muestra label de respuesta
   - ✅ Se muestra PuzzleGame con imagen dividida
   - ✅ Instrucciones: "Toca dos piezas para intercambiarlas"
   - ✅ Botón "🔄 Reiniciar" visible
   - ✅ NO hay botón "Verificar Respuesta" (envío automático)

3. **Prueba interacción:**
   - Toca una pieza
   - **Esperar:** Borde rosa (#FF6B9D) en la pieza seleccionada
   - **Esperar:** Texto "Selecciona otra pieza para intercambiar"
   - Toca otra pieza
   - **Esperar:** Las piezas se intercambian
   - **Esperar:** Selección se limpia

4. **Prueba completitud:**
   - Ordena todas las piezas correctamente
   - **Esperar:** Alert "¡Felicitaciones! 🎉" automáticamente
   - **Esperar:** Envío automático de verificación (500ms delay)
   - **Esperar:** Alert de nivel completado o incorrecto
   - Si correcto: navegación automática de vuelta

5. **Prueba reiniciar:**
   - Toca "🔄 Reiniciar"
   - **Esperar:** Piezas se desordenan de nuevo
   - **Esperar:** Al menos una pieza fuera de lugar

**Si el bug NO está corregido:**

1. Abre un nivel de tipo "foto"
2. **Esperar:** Mensaje "No hay imagen disponible para este puzzle"
3. ✅ Este comportamiento es esperado (ver MOBILE_FEATURE_GAPS.md)

---

### 7. Probar Sistema de Pistas

1. Abre cualquier nivel con pistas
2. Envía respuesta incorrecta
3. **Esperar:** Primera pista revelada
4. Envía otra respuesta incorrecta
5. **Esperar:** Segunda pista revelada
6. Envía otra respuesta incorrecta
7. **Esperar:** Tercera pista revelada
8. Verifica que no se revelan más pistas

---

### 8. Probar Límite de Intentos

1. Abre un nivel
2. Envía 5 respuestas incorrectas
3. En el 5to intento:
   - **Esperar:** Contador: 5 / 5
   - **Esperar:** Alert indicando máximo de intentos alcanzado
4. Verifica que no se puede enviar más respuestas

---

### 9. Probar Actualización de Progreso

1. Completa un nivel
2. Navega de vuelta a la lista de niveles
3. **Verifica:**
   - ✅ Nivel marcado como completado (checkmark ✅)
   - ✅ Barra de progreso actualizada (ej: 20% → 40%)
   - ✅ Siguiente nivel desbloqueado (si aplica)

4. Navega a HomeScreen
5. **Verifica:**
   - ✅ Estadísticas actualizadas
   - ✅ Progreso del juego actualizado

---

### 10. Probar Completar Juego

1. Completa todos los niveles del juego (5/5)
2. Al completar el último nivel:
   - **Esperar:** Alert "🎉 ¡Felicidades!"
   - **Esperar:** Mensaje: "¡Has completado todos los niveles! Tienes un premio esperándote"
   - **Esperar:** Botón "Ver Premio"

3. Toca "Ver Premio"
4. **Verifica:**
   - ✅ Se muestra el premio ganado
   - ✅ Juego marcado como "completado"
   - ✅ Progreso: 100%

---

## 🐛 Casos Edge a Verificar

### Nivel ya completado:
1. Intenta abrir un nivel ya completado
2. **Esperar:** Botón "Jugar Nivel" deshabilitado
3. **Esperar:** Texto "✅ Completado"

### Respuesta vacía:
1. Abre nivel de texto/lugar
2. No escribas nada
3. Toca "Verificar Respuesta"
4. **Esperar:** Alert "Por favor ingresa una respuesta"

### Fecha no seleccionada:
1. Abre nivel de fecha
2. No selecciones fecha
3. Toca "Verificar Respuesta"
4. **Esperar:** Alert "Por favor ingresa una respuesta"

### Conexión perdida:
1. Desactiva WiFi/datos
2. Intenta enviar respuesta
3. **Esperar:** Error de red manejado correctamente

### Token expirado:
1. Espera a que el token expire (o manipula SecureStore)
2. Intenta enviar respuesta
3. **Esperar:** Alert "Sesión expirada"
4. **Esperar:** Navegación a Login

---

## 📊 Checklist de Verificación

### UI General:
- [ ] Colores consistentes con el diseño
- [ ] Tipografías correctas
- [ ] Espaciados correctos
- [ ] Iconos y emojis visibles
- [ ] Animaciones suaves
- [ ] Sin flickering o parpadeos

### Funcionalidad:
- [ ] Todos los tipos de datos funcionan (excepto foto por bug backend)
- [ ] Validaciones funcionan correctamente
- [ ] Sistema de pistas funciona
- [ ] Límite de intentos funciona
- [ ] Progreso se actualiza correctamente
- [ ] Navegación funciona correctamente

### Rendimiento:
- [ ] Carga de niveles rápida (< 500ms)
- [ ] Verificación de respuesta rápida (< 1s)
- [ ] Sin lag en interacciones
- [ ] Invalidación de cache eficiente

### Errores:
- [ ] No hay errores en consola
- [ ] No hay warnings de React
- [ ] No hay crashes
- [ ] Manejo de errores correcto

---

## 🔧 Troubleshooting

### "No hay niveles disponibles"
**Causa:** Usuario no tiene UserData  
**Solución:** Crear UserData desde backoffice o API

### "Error al generar juego"
**Causa:** Usuario no tiene datos o premios  
**Solución:** Verificar que existen UserData y Prizes para el usuario

### "No hay imagen disponible para este puzzle"
**Causa:** Bug del backend (imagePath null en Level)  
**Solución:** Ver MOBILE_FEATURE_GAPS.md para instrucciones de corrección

### Respuesta correcta no se acepta
**Causa:** Normalización incorrecta o hash incorrecto  
**Solución:** Verificar que el backend normaliza igual que el móvil

### DatePicker no se abre
**Causa:** Permisos o versión de librería  
**Solución:** Verificar que @react-native-community/datetimepicker está instalado

---

## 📝 Reportar Problemas

Si encuentras un bug durante las pruebas:

1. Anota el tipo de nivel
2. Captura el error de consola (si hay)
3. Describe los pasos para reproducir
4. Anota el comportamiento esperado vs actual
5. Agrega screenshots si es posible

---

## ✅ Pruebas Completadas

Al terminar las pruebas, verifica:

- [ ] Todos los tipos de datos probados
- [ ] Todos los casos edge probados
- [ ] No hay errores en consola
- [ ] Progreso se actualiza correctamente
- [ ] Navegación funciona correctamente
- [ ] Sistema de pistas funciona
- [ ] Límite de intentos funciona
- [ ] Completar juego funciona

---

**¡Listo para probar! 🚀**
