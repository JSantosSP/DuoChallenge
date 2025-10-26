# 📱 Documentación Mobile - DuoChallenge

## 📋 Índice

1. [Resumen General](#resumen-general)
2. [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
3. [Mapa de Módulos](#mapa-de-módulos)
4. [Endpoints API](#endpoints-api)
5. [Flujo de Datos y Navegación](#flujo-de-datos-y-navegación)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [Gestión de Estado](#gestión-de-estado)
8. [Componentes Principales](#componentes-principales)
9. [Pantallas (Screens)](#pantallas-screens)
10. [Hooks Personalizados](#hooks-personalizados)

---

## 🎯 Resumen General

### Propósito
**DuoChallenge Mobile** es una aplicación móvil para parejas que permite crear y jugar juegos de retos personalizados. Los usuarios pueden:
- Crear datos personales (fechas, lugares, fotos, textos) que sirven como base para los retos
- Definir premios personalizados que se otorgan al completar juegos
- Generar juegos con niveles progresivos basados en sus datos personales
- Compartir códigos de juego para que su pareja pueda jugar con sus datos
- Resolver puzzles, adivinar fechas, lugares y responder preguntas personales

### Tecnologías Principales

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React Native | 0.81.5 | Framework de desarrollo móvil |
| Expo | 54.0.20 | Plataforma de desarrollo y build |
| React Navigation | 6.x | Sistema de navegación entre pantallas |
| TanStack Query (React Query) | 5.12.0 | Gestión de estado del servidor y caché |
| Axios | 1.6.0 | Cliente HTTP para comunicación con API |
| Expo Secure Store | 15.0.7 | Almacenamiento seguro de tokens |
| Dayjs | 1.11.10 | Manipulación de fechas |

### Arquitectura
- **Patrón:** Cliente-Servidor REST API
- **Gestión de Estado:** React Query (server state) + React Context (auth state)
- **Navegación:** Stack Navigator con autenticación
- **Almacenamiento:** SecureStore para tokens, React Query cache para datos

---

## 🏗️ Arquitectura y Tecnologías

### Estructura de Carpetas

```
mobile/
├── App.js                      # Punto de entrada, proveedores globales
├── app.config.js              # Configuración de Expo
├── assets/                    # Recursos estáticos (imágenes, iconos)
└── src/
    ├── api/
    │   └── api.js            # Cliente Axios y servicios API
    ├── components/            # Componentes reutilizables
    │   ├── AppButton.js
    │   ├── ChallengeInput.js
    │   ├── LoadingOverlay.js
    │   ├── ProgressBar.js
    │   └── PuzzleGame.js
    ├── config/
    │   └── env.js            # Variables de entorno
    ├── context/
    │   └── AuthContext.js    # Contexto de autenticación
    ├── hooks/                # Hooks personalizados
    │   ├── useGame.js
    │   ├── usePrize.js
    │   ├── useShare.js
    │   └── useUserData.js
    ├── navigation/
    │   └── AppNavigator.js   # Configuración de navegación
    ├── screens/              # Pantallas de la aplicación
    │   ├── LoginScreen.js
    │   ├── HomeScreen.js
    │   ├── GameDetailScreen.js
    │   ├── LevelScreen.js
    │   ├── ChallengeScreen.js
    │   ├── PrizeScreen.js
    │   ├── WonPrizesScreen.js
    │   ├── GameHistoryScreen.js
    │   ├── SettingsScreen.js
    │   ├── MyDataScreen.js
    │   ├── AddEditDataScreen.js
    │   ├── MyPrizesScreen.js
    │   ├── EditPrizeScreen.js
    │   ├── JoinGameScreen.js
    │   ├── ShareScreen.js
    │   └── PrizeTemplatesScreen.js
    └── utils/
        └── colors.js         # Paleta de colores
```

---

## 📦 Mapa de Módulos

### 1. **/api** - Comunicación con el Backend

**Archivo:** `api.js`

**Responsabilidades:**
- Configuración de cliente Axios con baseURL y timeout
- Interceptores para agregar token de autenticación automáticamente
- Interceptores para manejar errores 401 (sesión expirada)
- Definición de todos los servicios API como funciones exportadas

**Servicios Principales:**
- `apiService.login()` - Autenticación de usuario
- `apiService.generateGame()` - Genera un nuevo juego
- `apiService.getLevels()` - Obtiene niveles de un juego
- `apiService.verifyLevel()` - Verifica respuesta de un nivel
- `apiService.getUserData()` - Obtiene datos personales del usuario
- `apiService.createUserData()` - Crea nuevo dato personal
- `apiService.getUserPrizes()` - Obtiene premios del usuario
- `apiService.createShareCode()` - Genera código para compartir
- `apiService.joinGame()` - Unirse a juego con código

### 2. **/config** - Configuración

**Archivo:** `env.js`

**Responsabilidades:**
- Detectar entorno (desarrollo/producción)
- Proporcionar URLs de API según entorno
- Función `getImageUrl()` para construir URLs de imágenes
- Logging de configuración en desarrollo

### 3. **/context** - Estado Global

**Archivo:** `AuthContext.js`

**Responsabilidades:**
- Gestionar estado de autenticación del usuario
- Almacenar/recuperar tokens de SecureStore
- Proveer funciones `login()`, `logout()`, `refreshAuthToken()`
- Mantener información del usuario actual
- Configurar callback para logout automático en error 401

### 4. **/components** - Componentes Reutilizables

| Componente | Propósito |
|------------|-----------|
| **AppButton** | Botón estilizado con variantes (primary, secondary, outline), soporte para loading e iconos |
| **ChallengeInput** | Input especializado que cambia según tipo: texto, fecha, lugar o puzzle |
| **LoadingOverlay** | Overlay de carga con mensaje personalizable |
| **ProgressBar** | Barra de progreso animada para mostrar avance en niveles |
| **PuzzleGame** | Juego de puzzle interactivo con imágenes |

### 5. **/hooks** - Lógica Reutilizable

| Hook | Propósito |
|------|-----------|
| **useGame** | Gestión completa de juegos: generación, niveles, verificación, progreso, premios, historial |
| **useGameShare** | Gestión de códigos compartidos y unirse a juegos |
| **useWonPrizes** | Consulta de premios ganados |
| **usePrize** | CRUD de premios, plantillas, subida de imágenes, reactivación |
| **useShare** | Gestión de códigos de compartir, instancias de juego, compartir y copiar |
| **useShareValidation** | Validación de requisitos para generar códigos |
| **useUserData** | CRUD de datos personales, tipos disponibles, categorías, subida de imágenes |

### 6. **/navigation** - Navegación

**Archivo:** `AppNavigator.js`

**Estructura:**
- **AuthStack:** Pantalla de login
- **MainStack:** Todas las pantallas autenticadas
  - Home (con botón de configuración en header)
  - GameDetail, Level, Challenge
  - Prize, WonPrizes, GameHistory
  - Settings, MyData, AddData, EditData
  - MyPrizes, EditPrize, PrizeTemplates
  - JoinGame, Share

**Tipo:** Native Stack Navigator con condicional basado en `isAuthenticated`

### 7. **/screens** - Pantallas de la Aplicación

Ver sección completa [Pantallas (Screens)](#pantallas-screens)

### 8. **/utils** - Utilidades

**Archivo:** `colors.js`

**Contenido:**
- Paleta de colores del diseño (forest, ocean, neutral, status)
- Gradientes predefinidos
- Temas claro y oscuro (preparado para futuro soporte)

---

## 🔌 Endpoints API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login con email y password, retorna token y refreshToken |
| POST | `/auth/refresh` | Refresca el token de acceso |
| GET | `/auth/profile` | Obtiene perfil del usuario autenticado |

### Juegos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/game/generate` | Genera un nuevo juego con niveles aleatorios |
| GET | `/api/game/:gameSetId/levels` | Lista niveles de un juego específico |
| GET | `/api/game/level/:levelId` | Detalle de un nivel |
| POST | `/api/game/level/:levelId/verify` | Verifica respuesta de un nivel |
| GET | `/api/game/:gameSetId/progress` | Progreso actual del juego |
| GET | `/api/game/prize` | Premio asignado al completar el juego |
| POST | `/api/game/reset` | Reinicia el juego actual |
| GET | `/api/game/history` | Historial de juegos (con query ?status) |
| GET | `/api/game/stats` | Estadísticas del usuario |
| GET | `/api/game/active` | Juegos activos del usuario |

### Datos Personales (UserData)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/userdata` | Lista todos los datos personales del usuario |
| GET | `/api/userdata/types` | Tipos de datos disponibles (texto, fecha, foto, lugar) |
| POST | `/api/userdata` | Crea un nuevo dato personal |
| PUT | `/api/userdata/:id` | Actualiza un dato existente |
| DELETE | `/api/userdata/:id` | Elimina un dato |

### Premios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/prize-templates` | Plantillas de premios disponibles |
| GET | `/api/prize-templates/:id` | Detalle de una plantilla |
| GET | `/api/prizes` | Premios del usuario |
| GET | `/api/prizes/won` | Premios ganados por el usuario |
| POST | `/api/prizes` | Crea un nuevo premio |
| PUT | `/api/prizes/:id` | Actualiza un premio |
| DELETE | `/api/prizes/:id` | Elimina un premio |
| PUT | `/api/prizes/:id/reactivate` | Reactiva un premio usado |
| PUT | `/api/prizes/reactivate-all` | Reactiva todos los premios |

### Compartir
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/share/create` | Crea un código para compartir |
| GET | `/api/share/codes` | Códigos creados por el usuario |
| GET | `/api/share/used-codes` | Códigos que el usuario ha usado |
| GET | `/api/share/verify/:code` | Verifica validez de un código |
| POST | `/api/share/join` | Únete a un juego con código |
| GET | `/api/share/instances` | Instancias de juegos compartidos |
| DELETE | `/api/share/:id` | Desactiva un código |

### Utilidades
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/upload` | Sube una imagen (multipart/form-data) |
| GET | `/api/categories` | Categorías disponibles para datos |

---

## 🔄 Flujo de Datos y Navegación

### Flujo Principal del Usuario

```
┌─────────────┐
│   Login     │ (LoginScreen)
└──────┬──────┘
       │ Autenticación exitosa
       ▼
┌─────────────┐
│    Home     │ (HomeScreen)
└──────┬──────┘
       │
       ├─► Generar Juego ──► GameDetail ──► Level ──► Challenge ──► Prize
       │                                                               │
       │                                                               ▼
       ├─► Unirse a Juego ──► JoinGame ───────────────────► GameDetail
       │
       ├─► Mis Datos ──► MyData ──► AddEditData
       │
       ├─► Mis Premios ──► MyPrizes ──► PrizeTemplates ──► EditPrize
       │
       ├─► Compartir ──► Share
       │
       ├─► Premios Ganados ──► WonPrizes
       │
       ├─► Historial ──► GameHistory
       │
       └─► Configuración ──► Settings
```

### Flujo de Juego Detallado

1. **Generación de Juego**
   - Usuario hace clic en "Generar Mi Juego" desde Home
   - `useGame.generateGame()` → `POST /api/game/generate`
   - Backend selecciona datos personales aleatorios del usuario
   - Backend asigna un premio aleatorio basado en pesos
   - Se crea un GameSet con niveles (uno por dato)
   - Usuario es redirigido a GameDetail

2. **Jugando Niveles**
   - GameDetail muestra lista de niveles (bloqueados secuencialmente)
   - Usuario selecciona nivel desbloqueado → LevelScreen
   - LevelScreen → ChallengeScreen con el reto
   - ChallengeInput se adapta al tipo:
     - **texto/lugar:** TextInput simple
     - **fecha:** DatePicker nativo
     - **foto:** PuzzleGame interactivo
   - Usuario responde → `verifyLevel()` → `POST /api/game/level/:id/verify`
   - Si correcto: desbloquea siguiente nivel
   - Si incorrecto: muestra pista (si hay), reduce intentos
   - Si agota intentos: juego termina

3. **Completar Juego**
   - Al completar último nivel, backend marca juego como completado
   - Se asigna el premio al usuario
   - Modal de felicitación redirige a WonPrizes
   - Usuario puede ver su premio y reiniciar si es un juego compartido

### Flujo de Compartir

1. **Crear Código**
   - Usuario necesita tener al menos 1 dato personal y 1 premio
   - Settings → Share → Generar Nuevo Código
   - `createShareCode()` → `POST /api/share/create`
   - Backend genera código alfanumérico de 6 caracteres
   - Usuario puede copiar o compartir via Share API nativa

2. **Unirse a Juego**
   - Usuario recibe código de pareja
   - Home → Unirse a un Juego → JoinGameScreen
   - Ingresa código → verifica → muestra info del creador
   - Confirma → `joinGame()` → `POST /api/share/join`
   - Backend crea nuevo GameSet con los datos del creador
   - Usuario redirigido a Home, ve nuevo juego activo

3. **Reiniciar Juego Compartido**
   - Solo disponible para juegos unidos con código
   - Settings → Reiniciar Juego → selecciona código
   - `restartGame()` vuelve a llamar a `joinGame()` con el mismo código
   - Se genera un nuevo GameSet con datos diferentes del creador

---

## 🔐 Autenticación y Seguridad

### Almacenamiento de Tokens

**Librería:** Expo SecureStore (almacenamiento cifrado nativo)

**Tokens guardados:**
- `token`: JWT de acceso
- `refreshToken`: JWT para renovar el token de acceso
- `user`: Información del usuario (JSON stringificado)

### Flujo de Autenticación

1. **Login:**
   - Usuario ingresa email y password en LoginScreen
   - `AuthContext.login()` → `POST /auth/login`
   - Backend retorna `{ token, refreshToken, user }`
   - Se guardan en SecureStore
   - Se actualiza contexto de auth
   - Navigator cambia automáticamente a MainStack

2. **Peticiones Autenticadas:**
   - Interceptor de Axios en `api.js`
   - Antes de cada request: lee token de SecureStore
   - Agrega header: `Authorization: Bearer <token>`

3. **Sesión Expirada:**
   - Backend responde 401
   - Interceptor de respuesta detecta error 401
   - Elimina tokens de SecureStore
   - Llama a `logoutCallback` configurado por AuthContext
   - Muestra alerta "Sesión expirada"
   - Navigator cambia a AuthStack (LoginScreen)

4. **Refresh Token:**
   - Función `refreshAuthToken()` disponible pero no implementada automáticamente
   - Pensada para llamarse manualmente si es necesario
   - `POST /auth/refresh` con refreshToken actual
   - Actualiza ambos tokens en SecureStore

### Protección de Rutas

**Navigator condicional:**
```javascript
{isAuthenticated ? <MainStack /> : <AuthStack />}
```

- `isAuthenticated` se calcula como `!!token`
- Si no hay token, solo se muestra LoginScreen
- Al obtener token, se renderiza todo el MainStack

---

## 🎨 Gestión de Estado

### Estado del Servidor (React Query)

**Configuración:**
- `refetchOnWindowFocus: false` - No refrescar al volver a la app
- `retry: 1` - Un solo reintento en errores
- `staleTime: 5 * 60 * 1000` - 5 minutos de caché válido

**Queries principales:**

| Query Key | Endpoint | Uso |
|-----------|----------|-----|
| `['levels', gameSetId]` | `/api/game/:id/levels` | Niveles de un juego |
| `['progress', gameSetId]` | `/api/game/:id/progress` | Progreso del juego |
| `['activeGames']` | `/api/game/active` | Juegos activos |
| `['gameStats']` | `/api/game/stats` | Estadísticas |
| `['wonPrizes']` | `/api/prizes/won` | Premios ganados |
| `['sharecodes']` | `/api/share/codes` | Códigos creados |

**Mutaciones principales:**

| Mutación | Endpoint | Invalidaciones |
|----------|----------|----------------|
| `verifyLevel` | `POST /api/game/level/:id/verify` | `levels`, `progress`, `activeGames`, `gameStats` |
| `generateGame` | `POST /api/game/generate` | `levels`, `progress`, `activeGames`, `gameStats` |
| `createShareCode` | `POST /api/share/create` | `sharecodes` |
| `joinGame` | `POST /api/share/join` | `sharedGames`, `activeGames`, `levels` |

**Patrón de invalidación:**
```javascript
onSuccess: (data) => {
  queryClient.invalidateQueries(['relatedKey1']);
  queryClient.invalidateQueries(['relatedKey2']);
}
```

### Estado Local (React Context)

**AuthContext:**
- `user`: Objeto con info del usuario (name, email, role)
- `token`: JWT de acceso
- `refreshToken`: JWT de refresh
- `loading`: Estado de carga inicial
- `isAuthenticated`: Booleano derivado de !!token
- `login()`: Función para autenticar
- `logout()`: Función para cerrar sesión
- `refreshAuthToken()`: Función para renovar token

### Estado de Componentes (useState)

Usado para:
- Estado de formularios (inputs controlados)
- Filtros locales (ej: filtro por tipo en MyData)
- UI temporal (modals, loading buttons, etc.)

---

## 🧩 Componentes Principales

### AppButton
**Props:**
- `title` (string): Texto del botón
- `onPress` (function): Callback al presionar
- `loading` (boolean): Muestra indicador de carga
- `disabled` (boolean): Deshabilita el botón
- `variant` ('primary' | 'secondary' | 'outline'): Estilo del botón
- `icon` (string): Emoji o texto para icono
- `style` (object): Estilos adicionales

**Variantes:**
- `primary`: Fondo verde bosque, texto blanco
- `secondary`: Fondo azul claro, texto oscuro
- `outline`: Sin fondo, borde verde, texto verde

### ChallengeInput
**Props:**
- `type` ('texto' | 'fecha' | 'foto' | 'lugar'): Tipo de input
- `value` (string): Valor actual
- `onChangeText` (function): Callback al cambiar texto
- `challenge` (object): Datos del reto (para tipo foto)
- `onPuzzleComplete` (function): Callback al completar puzzle
- `style` (object): Estilos adicionales

**Comportamiento:**
- `texto/lugar`: Renderiza TextInput estándar
- `fecha`: Renderiza DateTimePicker nativo según plataforma
- `foto`: Renderiza PuzzleGame con imagen del challenge

### PuzzleGame
**Props:**
- `imageUri` (string): URL de la imagen
- `gridSize` (number): Tamaño de la cuadrícula (3x3, 4x4, 5x5)
- `onComplete` (function): Callback con orden de piezas al completar
- `style` (object): Estilos adicionales

**Lógica:**
- Divide imagen en N×N piezas
- Mezcla aleatoriamente las piezas (asegura que no esté resuelto)
- Usuario toca dos piezas para intercambiarlas
- Al ordenar correctamente, llama a `onComplete([1,2,3,4...])`
- Botón de reinicio para barajar de nuevo

### ProgressBar
**Props:**
- `progress` (number): Valor actual de progreso
- `total` (number): Valor máximo

**Renderiza:**
- Label "Progreso General" con porcentaje
- Barra animada con ancho proporcional
- Texto "X de Y retos completados"

### LoadingOverlay
**Props:**
- `message` (string): Mensaje a mostrar (default: "Cargando...")

**Uso:**
- Overlay de pantalla completa con fondo oscuro semi-transparente
- Spinner centrado con mensaje debajo
- Se muestra mientras `loading` es true en screens

---

## 📱 Pantallas (Screens)

### LoginScreen
**Ruta:** `/Login`
**Propósito:** Autenticación del usuario
**Estado:** No requiere autenticación
**Elementos:**
- Input de email
- Input de password (secureTextEntry)
- Botón "Entrar" con loading state
- Diseño centrado con emoji de corazón y branding

### HomeScreen ⭐
**Ruta:** `/Home`
**Propósito:** Dashboard principal de la aplicación
**Datos mostrados:**
- Estadísticas: juegos completados, premios, activos
- Premios ganados (últimos 3)
- Juegos activos con progreso y estado
- Historial de juegos (últimos 3)
- Acciones: Unirse a juego, Generar juego
- Navegación a: Mis Datos, Mis Premios

**Refresh:** Pull-to-refresh para actualizar todo

**Estados especiales:**
- Juegos inactivos: marcados visualmente, no se puede jugar
- Empty states para cada sección sin datos

### GameDetailScreen
**Ruta:** `/GameDetail`
**Params:** `{ gameSet: GameSetObject }`
**Propósito:** Ver detalles y niveles de un juego
**Elementos:**
- Tipo de juego (propio o compartido con código)
- Badge si está completado
- Barra de progreso general
- Lista de niveles con estados:
  - ✅ Completado (verde, fecha de completado)
  - 🎯 Disponible (blanco, muestra intentos)
  - 🔒 Bloqueado (gris, requiere completar anterior)
  - ❌ Sin intentos (rojo, agotó intentos)
- Botón "Ver Tu Premio" si está completado

### LevelScreen
**Ruta:** `/Level`
**Params:** `{ level: LevelObject, gameSetId }`
**Propósito:** Vista de un nivel individual antes de jugar
**Elementos:**
- Título "Nivel X"
- Pregunta del nivel
- Estado: completado o en progreso
- Intentos actuales / máximos
- Card con info: tipo, dificultad, pistas disponibles
- Botón "Jugar Nivel" (deshabilitado si completado)

### ChallengeScreen
**Ruta:** `/Challenge`
**Params:** `{ challenge: ChallengeObject, levelId, gameSetId }`
**Propósito:** Resolver un reto
**Elementos:**
- Tipo de reto (con emoji)
- Imagen (si no es tipo foto)
- Pregunta del reto
- Pistas (progresivamente desbloqueadas)
- Input según tipo de reto (ChallengeInput)
- Botón "Verificar Respuesta" (excepto para puzzles que verifican automáticamente)
- Contador de intentos

**Lógica:**
- Verifica respuesta con backend
- Si correcta: navega de vuelta con éxito
- Si incorrecta: muestra pista siguiente (si hay)
- Si agota intentos: alerta y navega a Home

### PrizeScreen
**Ruta:** `/Prize`
**Params:** `{ gameSetId, shareCode }`
**Propósito:** Mostrar premio ganado
**Elementos:**
- Animación de entrada (fade + scale)
- Emoji de celebración 🎉
- Card del premio con:
  - Icono 🏆
  - Imagen del premio
  - Título y descripción
- Mensaje motivacional
- Botón "Iniciar Nuevo Juego" (solo si tiene shareCode)
- Botón "Volver al Inicio"

**Comportamiento:**
- Header modificado para navegar a WonPrizes en "Atrás"
- `restartGame()` vuelve a unirse con el mismo código

### WonPrizesScreen
**Ruta:** `/WonPrizes`
**Propósito:** Lista de todos los premios ganados
**Elementos:**
- Título con contador total
- Stats: Total, Canjeados, Disponibles
- Lista de premios con:
  - Imagen
  - Título y descripción
  - Badge de peso (color según valor)
  - Badge "Canjeado" si fue usado
  - Fechas de ganado y canjeado
- Empty state si no hay premios

**Comportamiento:**
- Header modificado para navegar a Home en "Atrás"

### GameHistoryScreen
**Ruta:** `/GameHistory`
**Propósito:** Historial completo de juegos
**Elementos:**
- Filtros: Todos, Completados, Activos, Abandonados
- Stats globales (total juegos, completados)
- Cards de juegos con:
  - Tipo (propio o compartido)
  - Badge de estado (color según status)
  - Progreso %
  - Niveles completados / totales
  - Fechas de inicio y fin
  - Indicador "Premio ganado" si aplica
- Empty state según filtro activo

### SettingsScreen
**Ruta:** `/Settings`
**Propósito:** Configuración y acciones del usuario
**Elementos:**
- **Perfil:** nombre, email, rol
- **Estadísticas:** completados, activos, niveles, premios
- **Acciones:**
  - Reiniciar Juego (modal con códigos disponibles)
  - Comparte tus retos → ShareScreen
  - Mis Datos Personales → MyData
  - Mis Premios → MyPrizes
  - Cerrar Sesión (con confirmación)
- **About:** versión de la app

**Modal de Reinicio:**
- Lista códigos compartidos que el usuario ha usado
- Seleccionar uno para generar nuevo juego
- Confirmación antes de crear

### MyDataScreen
**Ruta:** `/MyData`
**Propósito:** CRUD de datos personales
**Elementos:**
- Filtros por tipo: Todos, texto, fecha, foto, lugar
- Lista de datos con:
  - Icono según tipo
  - Pregunta (título)
  - Tipo + categoría
  - Número de pistas
  - Botón eliminar 🗑️
- Botón "Agregar Nuevo Dato"
- Empty state según filtro

**Acciones:**
- Tap en dato → EditData (modo edición)
- Tap en eliminar → confirmación → DELETE /api/userdata/:id

### AddEditDataScreen
**Ruta:** `/AddData` | `/EditData`
**Params (EditData):** `{ item: UserDataObject }`
**Propósito:** Crear o editar dato personal
**Formulario:**
1. **Tipo de dato** (botones con iconos): texto, fecha, foto, lugar
2. **Valor:**
   - texto: TextInput
   - fecha: DatePicker
   - foto: ImagePicker + selector de grid (3x3, 4x4, 5x5)
   - lugar: TextInput
3. **Pregunta:** TextInput multiline
4. **Pistas:** 3 TextInputs opcionales
5. **Categoría:** Botones de selección
6. **Dificultad:** Fácil 🟢, Medio 🟡, Difícil 🔴

**Validaciones:**
- Tipo requerido
- Valor requerido (excepto foto que usa imagePath)
- Pregunta requerida
- Categoría requerida
- Máximo 3 pistas

### MyPrizesScreen
**Ruta:** `/MyPrizes`
**Propósito:** CRUD de premios personalizados
**Elementos:**
- Stats: Total, Canjeados, Disponibles
- Botón "Reiniciar Todos los Premios Canjeados" (si aplica)
- Lista de premios con:
  - Imagen
  - Título y descripción
  - Badge de peso (color según valor)
  - Badge "Canjeado" si fue usado
  - Botón eliminar 🗑️
  - Botón "Reiniciar Premio" (solo si usado)
- Botón "Agregar Nuevo Premio" → PrizeTemplatesScreen

**Acciones:**
- Tap en premio → EditPrize (modo edición)
- Reiniciar premio individual: PUT /api/prizes/:id/reactivate
- Reiniciar todos: PUT /api/prizes/reactivate-all

### EditPrizeScreen
**Ruta:** `/EditPrize`
**Params:** `{ prize?: PrizeObject, template?: TemplateObject }`
**Propósito:** Crear/editar premio o personalizar plantilla
**Formulario:**
1. **Título:** TextInput
2. **Descripción:** TextInput multiline
3. **Imagen:** ImagePicker opcional
4. **Peso (1-10):** Selector circular con colores
   - 1-3: Verde (poco probable)
   - 4-6: Naranja (medio)
   - 7-10: Rojo (muy probable)

**Validaciones:**
- Título requerido
- Descripción requerida
- Peso entre 1-10

**Modos:**
- Editar: carga datos del premio existente
- Desde plantilla: pre-carga datos de la plantilla
- Desde cero: formulario vacío

### PrizeTemplatesScreen
**Ruta:** `/PrizeTemplates`
**Propósito:** Seleccionar plantilla para crear premio
**Elementos:**
- Botón "Crear desde cero" → EditPrize vacío
- Lista de plantillas (si las hay) con:
  - Imagen
  - Título y descripción resumida
  - Peso del premio
  - Flecha para seleccionar
- Empty state si no hay plantillas

**Acción:**
- Tap en plantilla → EditPrize con datos pre-cargados

### JoinGameScreen
**Ruta:** `/JoinGame`
**Propósito:** Unirse a juego con código
**Elementos:**
- Input de código (6 caracteres, mayúsculas, monospace)
- Botón "Verificar Código"
- Card de info del juego (si código válido):
  - Creador
  - Código confirmado
  - Descripción
  - Botón "Unirse al Juego"
- Sección de ayuda: cómo obtener código

**Flujo:**
1. Usuario ingresa código
2. Verifica con GET /api/share/verify/:code
3. Si válido, muestra info y botón de unirse
4. Al unirse: POST /api/share/join
5. Redirige a Home con nuevo juego activo

### ShareScreen
**Ruta:** `/Share`
**Propósito:** Gestionar códigos compartidos
**Elementos:**
- Botón "Generar Nuevo Código" (deshabilitado si no cumple requisitos)
- Mensaje de validación si falta datos o premios
- **Códigos Activos:**
  - Código en grande (monospace)
  - Badge de estado (Activo/Expirado/Inactivo)
  - Fecha de creación
  - Conteo de usuarios que lo usaron
  - Botones: Copiar 📋, Compartir 📤, Desactivar ❌
- **Códigos Inactivos:** (si existen)
- **Juegos Activos:** Lista de juegos en los que participa

**Validación para generar:**
- Al menos 1 dato personal
- Al menos 1 premio
- Mensaje específico si falta alguno

---

## 🔧 Hooks Personalizados

### useGame(gameSetId, shareCode)
**Propósito:** Gestión completa de juegos
**Retorna:**
```javascript
{
  // Queries
  levels,              // Niveles del juego
  levelsLoading,       // Estado de carga
  progress,            // Progreso del juego
  activeGames,         // Juegos activos
  activeGamesLoading,  // Estado de carga
  stats,               // Estadísticas globales
  prize,               // Premio del juego
  
  // Mutations
  verifyLevel(params, callbacks),  // Verifica respuesta
  verifyLoading,                    // Estado de verificación
  getPrize(),                       // Obtiene premio
  restartGame({ shareCode }),       // Reinicia juego compartido
  generateGame(),                   // Genera nuevo juego
  
  // Funciones
  getHistory(status),   // Obtiene historial
  
  // Refetch
  refetchLevels,
  refetchProgress,
  refetchActiveGames,
  refetchStats,
}
```

**Lógica especial:**
- `verifyLevel` invalida múltiples queries al completar nivel
- Muestra alertas automáticas al completar nivel/juego
- `restartGame` solo funciona con códigos compartidos

### useGameShare()
**Propósito:** Gestión de códigos compartidos
**Retorna:**
```javascript
{
  shareCodes,           // Códigos creados por el usuario
  codesLoading,
  sharedGames,          // Juegos compartidos activos
  sharedGamesLoading,
  
  createCode(),         // Genera nuevo código
  verifyCode(code),     // Verifica código
  joinGame(code),       // Únete a juego
  deactivateCode(id),   // Desactiva código
  
  isCreatingCode,
  isJoining,
  
  refetchCodes,
  refetchSharedGames,
}
```

### useWonPrizes()
**Propósito:** Consulta de premios ganados
**Retorna:**
```javascript
{
  wonPrizes,  // Array de premios
  isLoading,
  refetch,
  total,      // Número total
}
```

### usePrize()
**Propósito:** CRUD completo de premios
**Retorna:**
```javascript
{
  prizeTemplates,              // Plantillas disponibles
  userPrizes,                  // Premios del usuario
  loading,
  error,
  
  fetchPrizeTemplates(),
  fetchUserPrizes(),
  createPrizeFromTemplate(templateId, customizations),
  createPrize(data),
  updatePrize(id, data),
  deletePrize(id),
  uploadImage(imageUri),
  reactivatePrize(id),          // Reactiva premio usado
  reactivateAllPrizes(),        // Reactiva todos
  
  refetch(),
}
```

### useShare()
**Propósito:** Gestión de códigos y compartir
**Retorna:**
```javascript
{
  shareCodes,              // Códigos del usuario
  usedShareCodes,          // Códigos que ha usado
  gameInstances,           // Instancias de juego
  loading,
  error,
  
  createShareCode(),
  verifyShareCode(code),
  joinGame(code),
  deactivateShareCode(codeId),
  shareCode(code),          // Share API nativa
  copyCodeToClipboard(code),
  
  fetchShareCodes,
  fetchUsedShareCodes,
  fetchGameInstances,
  refetch(),
}
```

### useShareValidation()
**Propósito:** Validar si puede generar códigos
**Retorna:**
```javascript
{
  canGenerate,          // Boolean
  validationMessage,    // Mensaje de error si no puede
  checkCanGenerate(),
}
```
**Lógica:** Verifica que tenga al menos 1 dato personal y 1 premio

### useUserData()
**Propósito:** CRUD de datos personales
**Retorna:**
```javascript
{
  userData,            // Datos del usuario
  availableTypes,      // Tipos disponibles (texto, fecha, etc.)
  categories,          // Categorías disponibles
  loading,
  error,
  
  createUserData(data),
  updateUserData(id, data),
  deleteUserData(id),
  uploadImage(imageUri),
  
  fetchUserData,
  refetch,
}
```

---

## 📝 Notas Adicionales

### Gestión de Imágenes

**Subida:**
1. Usuario selecciona imagen con `expo-image-picker`
2. Se convierte a FormData: `formData.append('image', { uri, type, name })`
3. POST /api/upload con header `multipart/form-data`
4. Backend retorna: `{ path: '/uploads/...', fullUrl: 'http://...' }`
5. Se guarda `path` en DB, se usa `fullUrl` para vista inmediata

**Visualización:**
- Función `getImageUrl(path)` construye URL completa
- Si path ya es URL completa, retorna tal cual
- Si es relativa, prepone `API_URL`

### Manejo de Errores

**Axios Interceptors:**
- Error 401: logout automático + alerta
- Otros errores: se propagan a los hooks
- React Query maneja reintentos (config: retry: 1)

**En Hooks:**
- Mutaciones usan callbacks `onSuccess` / `onError`
- Alertas automáticas con `Alert.alert()`
- Mensajes personalizados según contexto

### Refresh de Datos

**Estrategias:**
1. **Pull-to-refresh:** ScrollView con RefreshControl
2. **useFocusEffect:** Refetch al volver a pantalla
3. **Invalidaciones:** React Query invalida queries relacionadas

**Ejemplo en HomeScreen:**
```javascript
useFocusEffect(
  React.useCallback(() => {
    refetchActiveGames();
    refetchStats();
    refetchWonPrizes();
  }, [])
);
```

### Optimizaciones

- React Query cachea datos 5 minutos (staleTime)
- Imágenes con `resizeMode="cover"` para performance
- Navigación con `react-native-screens` (optimizado)
- Lazy loading de screens (React Navigation default)

---

## 🚀 Guía para Nuevos Desarrolladores

### Setup Inicial

1. **Instalar dependencias:**
   ```bash
   cd mobile
   npm install
   # o
   yarn install
   ```

2. **Configurar variables de entorno:**
   Editar `app.config.js` → sección `extra`:
   - `EXPO_PUBLIC_PRO`: 'false' para dev, 'true' para prod
   - `EXPO_PUBLIC_API_URL_DEV`: URL del backend local
   - `EXPO_PUBLIC_API_URL_PRO`: URL del backend de producción

3. **Ejecutar:**
   ```bash
   npm start
   # o
   yarn start
   ```
   Luego presionar 'i' para iOS, 'a' para Android, 'w' para web

### Estructura de una Pantalla Típica

```javascript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import LoadingOverlay from '../components/LoadingOverlay';
import colors from '../utils/colors';

const MiScreen = ({ navigation, route }) => {
  const { data, loading, refetch } = useMiHook();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <LoadingOverlay message="Cargando..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Contenido */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.backgroundLight,
  },
  scroll: {
    flex: 1,
  },
});

export default MiScreen;
```

### Agregar Nueva Pantalla

1. Crear archivo en `/src/screens/NuevaScreen.js`
2. Implementar componente siguiendo estructura estándar
3. Agregar import en `/src/navigation/AppNavigator.js`
4. Agregar `<Stack.Screen>` en MainStack o AuthStack
5. Navegar usando: `navigation.navigate('NombrePantalla', { params })`

### Crear Nuevo Hook

1. Crear archivo en `/src/hooks/useMiHook.js`
2. Usar React Query o useState según necesidad
3. Retornar objeto con datos y funciones
4. Importar y usar en pantallas

### Estilos y Temas

- Usar `colors` de `/src/utils/colors.js`
- Seguir convención de nombres descriptivos
- Usar `StyleSheet.create()` al final del archivo
- Preferir flex layout sobre posicionamiento absoluto

---

Esta documentación cubre la estructura y funcionamiento completo de la aplicación móvil DuoChallenge. Para cualquier duda o ampliación, referirse al código fuente o contactar al equipo de desarrollo.

**Última actualización:** 2025-10-26