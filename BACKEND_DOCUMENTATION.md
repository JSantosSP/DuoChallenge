# 📚 Documentación del Backend - DuoChallenge

> **Versión:** 1.0.0  
> **Fecha:** 2025-10-26  
> **Autor:** Sistema de documentación automática

---

## 📋 Índice

1. [Resumen General](#-resumen-general)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Tecnologías y Dependencias](#-tecnologías-y-dependencias)
4. [Mapa de Módulos](#-mapa-de-módulos)
5. [Modelos de Datos](#-modelos-de-datos)
6. [Controladores](#-controladores)
7. [Rutas (API Endpoints)](#-rutas-api-endpoints)
8. [Servicios](#-servicios)
9. [Middlewares](#-middlewares)
10. [Utilidades](#-utilidades)
11. [Flujo de Datos](#-flujo-de-datos)
12. [Autenticación y Seguridad](#-autenticación-y-seguridad)
13. [Seeds y Datos Iniciales](#-seeds-y-datos-iniciales)
14. [Variables de Entorno](#-variables-de-entorno)
15. [Áreas de Mejora](#-áreas-de-mejora)

---

## 🎯 Resumen General

**DuoChallenge** es un backend REST API desarrollado en **Node.js + Express** que gestiona un sistema de juegos de desafíos personalizados entre usuarios. El sistema permite:

- **Crear datos personalizados** (preguntas, respuestas, imágenes, fechas, lugares)
- **Generar juegos aleatorios** basados en estos datos
- **Compartir juegos** mediante códigos únicos
- **Asignar premios** al completar desafíos
- **Gestionar usuarios** con roles (admin/player)

### Propósito

El backend sirve como motor de juego para una aplicación móvil donde parejas pueden crear desafíos personalizados basados en su relación, compartirlos y jugar juntos.

---

## 🏗️ Arquitectura del Sistema

### Patrón Arquitectónico

El backend sigue una arquitectura **MVC modificada** con separación de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│                    (Mobile App / Backoffice)                 │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼────────────────────────────────┐
│                       SERVER.JS                              │
│              Express + Middleware + CORS                     │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
         │  ROUTES │   │  MIDDLEWARE │  STATIC  │
         │         │   │  Auth/Upload│  /uploads│
         └────┬────┘   └─────────────┘ └─────────┘
              │
         ┌────▼────────────┐
         │  CONTROLLERS    │
         │  Lógica de      │
         │  negocio HTTP   │
         └────┬────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌──▼────┐ ┌──▼────┐
│SERVICES│ │MODELS │ │ UTILS │
│Lógica  │ │MongoDB│ │Hash   │
│Compleja│ │Schemas│ │Seed   │
└────────┘ └───┬───┘ └───────┘
               │
          ┌────▼────┐
          │ MongoDB │
          │Database │
          └─────────┘
```

### Tipo de API

- **REST API** pura
- Retorna JSON en todas las respuestas
- Autenticación mediante **JWT (JSON Web Tokens)**
- Manejo de errores centralizado

---

## 🔧 Tecnologías y Dependencias

### Core Dependencies

```json
{
  "express": "^4.18.2",           // Framework web
  "mongoose": "^7.5.0",           // ODM para MongoDB
  "bcryptjs": "^2.4.3",           // Hash de contraseñas
  "jsonwebtoken": "^9.0.2",       // Generación de JWT
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.3.1",            // Variables de entorno
  "multer": "^1.4.5-lts.1",       // Upload de archivos
  "crypto": "^1.0.1"              // Hashing y semillas
}
```

### Dev Dependencies

```json
{
  "nodemon": "^3.0.1"             // Auto-reload en desarrollo
}
```

### Base de Datos

- **MongoDB** (v7+)
- **Mongoose** como ODM
- Índices en campos críticos (email, gameSetId, etc.)

---

## 📂 Mapa de Módulos

### Estructura de Carpetas

```
backend/
├── server.js                    # Punto de entrada principal
├── package.json                 # Dependencias y scripts
├── .env                         # Variables de entorno (no versionado)
│
├── uploads/                     # Archivos subidos por usuarios
│
└── src/
    ├── config/                  # Configuración global
    │   ├── index.js            # Configuración centralizada
    │   └── database.js         # Conexión a MongoDB
    │
    ├── models/                  # Esquemas de Mongoose
    │   ├── User.model.js       # Usuarios
    │   ├── Category.model.js   # Categorías de datos
    │   ├── Variable.model.js   # Tipos de dato
    │   ├── UserData.model.js   # Datos personalizados
    │   ├── GameSet.model.js    # Sets de juego
    │   ├── Level.model.js      # Niveles individuales
    │   ├── Prize.model.js      # Premios de usuarios
    │   ├── PrizeTemplate.model.js # Plantillas de premio
    │   ├── GameShare.model.js  # Códigos compartidos
    │   └── index.js            # Export centralizado
    │
    ├── controllers/             # Lógica de negocio HTTP
    │   ├── auth.controller.js  # Autenticación
    │   ├── game.controller.js  # Lógica de juego
    │   ├── admin.controller.js # Administración
    │   ├── userdata.controller.js # Datos personalizados
    │   ├── prize.controller.js # Premios
    │   ├── prizeTemplate.controller.js # Plantillas
    │   ├── share.controller.js # Compartir juegos
    │   └── category.controller.js # Categorías
    │
    ├── routes/                  # Definición de endpoints
    │   ├── auth.routes.js
    │   ├── game.routes.js
    │   ├── admin.routes.js
    │   ├── userdata.routes.js
    │   ├── prize.routes.js
    │   ├── prizeTemplate.routes.js
    │   ├── share.routes.js
    │   ├── category.routes.js
    │   └── category.get.routes.js
    │
    ├── services/                # Lógica de negocio compleja
    │   ├── gameset.service.js  # Generación de sets
    │   ├── level.service.js    # Generación de niveles
    │   └── prize.service.js    # Asignación de premios
    │
    ├── middlewares/             # Middlewares de Express
    │   ├── auth.middleware.js  # Verificación JWT
    │   └── upload.middleware.js # Upload de imágenes
    │
    ├── utils/                   # Utilidades
    │   ├── hash.util.js        # Hashing y verificación
    │   └── seed.util.js        # Aleatoriedad determinista
    │
    └── seeds/                   # Datos iniciales
        ├── seed.js             # Seed principal
        └── seedCategories.js   # Seed de categorías
```

### Propósito de cada carpeta

| Carpeta | Propósito |
|---------|-----------|
| **config/** | Configuración centralizada del sistema y base de datos |
| **models/** | Definición de esquemas y relaciones de MongoDB |
| **controllers/** | Manejo de requests HTTP y respuestas |
| **routes/** | Definición de endpoints y binding con controladores |
| **services/** | Lógica de negocio compleja reutilizable |
| **middlewares/** | Funciones intermedias en el pipeline de requests |
| **utils/** | Funciones auxiliares sin dependencias de negocio |
| **seeds/** | Scripts para poblar la base de datos |

---

## 🗃️ Modelos de Datos

### Entidades Principales

#### 1. **User** (Usuario)

```javascript
{
  name: String,              // Nombre completo
  email: String,             // Email único
  passwordHash: String,      // Contraseña hasheada
  role: String,              // 'admin' | 'player'
  totalSetsCompleted: Number // Sets completados
}
```

**Relaciones:**
- Tiene muchos `UserData` (datos personalizados)
- Tiene muchos `Prize` (premios creados)
- Tiene muchos `GameSet` (juegos jugados)
- Puede crear `GameShare` (códigos compartidos)

---

#### 2. **Category** (Categoría)

```javascript
{
  name: String,         // Nombre único (ej: "Fechas Especiales")
  description: String,  // Descripción del tipo de datos
  active: Boolean       // Si está activa
}
```

**Propósito:** Clasificar los datos personalizados del usuario.

**Ejemplos:**
- Fechas Especiales
- Lugares Memorables
- Personas Importantes
- Fotos y Recuerdos

---

#### 3. **Variable** (Tipo de Dato)

```javascript
{
  type: String,    // 'foto' | 'fecha' | 'lugar' | 'texto'
  active: Boolean  // Si está activo
}
```

**Propósito:** Define qué tipo de respuesta espera un nivel.

---

#### 4. **UserData** (Dato Personalizado)

```javascript
{
  userId: ObjectId,        // Propietario
  tipoDato: ObjectId,      // Tipo (Variable)
  valor: Object,           // Respuesta correcta
  pregunta: String,        // Pregunta del nivel
  pistas: [String],        // Pistas progresivas
  categorias: ObjectId,    // Categoría
  imagePath: String,       // Imagen (para tipo 'foto')
  puzzleGrid: Number,      // Tamaño puzzle (2-5)
  difficulty: String,      // 'easy' | 'medium' | 'hard'
  active: Boolean          // Si está activo
}
```

**Propósito:** Datos personalizados que crea cada usuario para generar niveles.

---

#### 5. **GameSet** (Set de Juego)

```javascript
{
  userId: ObjectId,           // Jugador
  creatorId: ObjectId,        // Creador de los datos
  shareId: ObjectId,          // GameShare (si es compartido)
  shareCode: String,          // Código usado
  levels: [ObjectId],         // Niveles del set
  seed: String,               // Semilla aleatoria
  prizeId: ObjectId,          // Premio asignado
  status: String,             // 'active' | 'completed' | 'abandoned'
  startedAt: Date,            // Fecha de inicio
  completedAt: Date,          // Fecha de completitud
  completedLevels: [ObjectId], // Niveles completados
  totalLevels: Number,        // Total de niveles
  progress: Number,           // Porcentaje (0-100)
  active: Boolean             // Si está activo
}
```

**Propósito:** Representa un juego completo con múltiples niveles.

**Flujo de vida:**
1. Se crea con `status: 'active'`
2. Se va completando nivel por nivel
3. Al completar todos: `status: 'completed'`, se asigna premio
4. Puede ser abandonado: `status: 'abandoned'`

---

#### 6. **Level** (Nivel)

```javascript
{
  gameSetId: ObjectId,     // Set al que pertenece
  categoryId: ObjectId,    // Categoría
  tipoDato: ObjectId,      // Tipo de dato (Variable)
  difficulty: String,      // 'easy' | 'medium' | 'hard'
  order: Number,           // Orden en el set
  currentAttempts: Number, // Intentos realizados
  maxAttempts: Number,     // Máximo de intentos (5)
  completed: Boolean,      // Si fue completado
  completedAt: Date,       // Fecha de completitud
  valor: Object,           // { hash, salt }
  pregunta: String,        // Pregunta
  pistas: [String],        // Pistas
  puzzleGrid: Number,      // Tamaño puzzle
  imagePath: String        // Imagen (tipo foto)
}
```

**Propósito:** Nivel individual dentro de un GameSet.

**Seguridad:** La respuesta correcta se almacena como hash SHA-256 con salt.

---

#### 7. **Prize** (Premio)

```javascript
{
  userId: ObjectId,      // Propietario
  title: String,         // Título
  description: String,   // Descripción
  imagePath: String,     // Imagen del premio
  used: Boolean,         // Si ya fue usado
  usedBy: ObjectId,      // Quién lo usó
  usedAt: Date,          // Cuándo fue usado
  weight: Number,        // Peso (1-10) para selección
  active: Boolean        // Si está activo
}
```

**Propósito:** Premios personalizados que crea cada usuario.

**Selección:** Usa selección aleatoria ponderada por `weight`.

---

#### 8. **PrizeTemplate** (Plantilla de Premio)

```javascript
{
  title: String,
  description: String,
  imagePath: String,
  weight: Number,
  active: Boolean
}
```

**Propósito:** Plantillas predefinidas de premios como inspiración.

---

#### 9. **GameShare** (Código Compartido)

```javascript
{
  creatorId: ObjectId,    // Creador del código
  code: String,           // Código único (6 chars)
  active: Boolean,        // Si está activo
  usedBy: [{              // Usuarios que lo usaron
    userId: ObjectId,
    joinedAt: Date
  }],
  maxUses: Number,        // Límite de usos
  expiresAt: Date         // Fecha de expiración
}
```

**Propósito:** Permite compartir juegos personalizados mediante códigos.

---

### Relaciones del Sistema

```mermaid
graph TB
    User -->|crea| UserData
    User -->|crea| Prize
    User -->|crea| GameShare
    User -->|juega| GameSet
    
    GameSet -->|pertenece a| User
    GameSet -->|creado por| User
    GameSet -->|tiene| Level
    GameSet -->|asigna| Prize
    GameSet -->|viene de| GameShare
    
    Level -->|pertenece a| GameSet
    Level -->|es de tipo| Variable
    Level -->|es de categoría| Category
    Level -->|creado desde| UserData
    
    UserData -->|pertenece a| User
    UserData -->|es de tipo| Variable
    UserData -->|es de categoría| Category
    
    Prize -->|pertenece a| User
    PrizeTemplate -->|inspira| Prize
```

---

## 🎮 Controladores

### 1. **auth.controller.js**

Gestiona autenticación y perfil de usuario.

**Funciones principales:**

| Función | Descripción | Parámetros | Retorna |
|---------|-------------|------------|---------|
| `register` | Registra nuevo usuario | name, email, password, role | Usuario + tokens JWT |
| `login` | Autentica usuario | email, password | Usuario + tokens JWT |
| `refreshToken` | Renueva tokens | refreshToken | Nuevos tokens |
| `getProfile` | Obtiene perfil | - | Datos del usuario |

**Tokens generados:**
- **Access Token:** Expira en 24h
- **Refresh Token:** Expira en 7 días

---

### 2. **game.controller.js**

Gestiona toda la lógica del juego.

**Funciones principales:**

| Función | Descripción |
|---------|-------------|
| `generateGame` | Genera un nuevo set de juego con niveles aleatorios |
| `getLevels` | Obtiene todos los niveles de un set |
| `getLevel` | Obtiene un nivel específico |
| `verifyLevel` | Verifica la respuesta de un nivel |
| `getPrize` | Obtiene el premio de un set completado |
| `resetGame` | Abandona juegos activos y genera uno nuevo |
| `getProgress` | Obtiene el progreso de un set |
| `getHistory` | Obtiene historial de juegos |
| `getStats` | Obtiene estadísticas del usuario |
| `getActiveGames` | Obtiene juegos activos |

**Flujo de verificación de nivel:**

1. Usuario envía respuesta
2. Se verifica tipo de dato (texto/fecha/lugar/foto)
3. Se hashea la respuesta del usuario
4. Se compara con el hash almacenado
5. Si es correcta:
   - Se marca nivel como completado
   - Se actualiza progreso del set
   - Se verifica si el set está completo
   - Si está completo: se asigna premio
6. Si es incorrecta:
   - Se incrementa contador de intentos
   - Se retorna pista si quedan intentos

---

### 3. **admin.controller.js**

Gestiona operaciones administrativas.

**Funciones principales:**

| Área | Funciones |
|------|-----------|
| **Variables** | getVariables, createVariable, updateVariable, deleteVariable |
| **Premios** | getPrizes, createPrize, updatePrize, deletePrize |
| **Usuarios** | getUsers, getUserById, resetUserProgress, getUserDataById |
| **Sistema** | uploadImage, getStats, getAllUserData, toggleUserDataActive |

---

### 4. **userdata.controller.js**

Gestiona datos personalizados del usuario.

| Función | Descripción |
|---------|-------------|
| `getUserData` | Obtiene datos del usuario |
| `createUserData` | Crea nuevo dato personalizado |
| `updateUserData` | Actualiza dato existente |
| `deleteUserData` | Desactiva dato (soft delete) |
| `getAvailableTypes` | Obtiene tipos de datos disponibles |

---

### 5. **prize.controller.js**

Gestiona premios personalizados.

| Función | Descripción |
|---------|-------------|
| `getUserPrizes` | Obtiene premios del usuario |
| `createPrize` | Crea nuevo premio |
| `updatePrize` | Actualiza premio |
| `deletePrize` | Desactiva premio |
| `getUserWonPrizes` | Obtiene premios ganados |
| `reactivatePrize` | Reactiva un premio usado |
| `reactivateAllPrizes` | Reactiva todos los premios |

---

### 6. **prizeTemplate.controller.js**

Gestiona plantillas de premios predefinidos.

---

### 7. **share.controller.js**

Gestiona códigos compartidos.

| Función | Descripción |
|---------|-------------|
| `createShareCode` | Genera código único de 6 caracteres |
| `getUserShareCodes` | Obtiene códigos creados por el usuario |
| `getUserUsedShareCodes` | Obtiene códigos usados por el usuario |
| `verifyShareCode` | Verifica validez de un código |
| `joinGame` | Une al usuario a un juego compartido |
| `getGameInstances` | Obtiene instancias de juegos compartidos |
| `deactivateShareCode` | Desactiva código |

---

### 8. **category.controller.js**

Gestiona categorías de datos.

---

## 🛣️ Rutas (API Endpoints)

### Autenticación (`/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Registrar usuario |
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/refresh` | ❌ | Renovar token |
| GET | `/auth/profile` | ✅ | Obtener perfil |

---

### Juego (`/api` y `/api/game`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/generate` | ✅ | Generar nuevo juego |
| POST | `/api/reset` | ✅ | Reiniciar juegos |
| GET | `/api/active` | ✅ | Obtener juegos activos |
| GET | `/api/history` | ✅ | Historial de juegos |
| GET | `/api/stats` | ✅ | Estadísticas del usuario |
| GET | `/api/:gameSetId/levels` | ✅ | Niveles del set |
| GET | `/api/:gameSetId/progress` | ✅ | Progreso del set |
| GET | `/api/level/:LevelId` | ✅ | Obtener nivel |
| POST | `/api/level/:levelId/verify` | ✅ | Verificar respuesta |
| GET | `/api/prize` | ✅ | Obtener premio |

---

### Datos de Usuario (`/api/userdata`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/userdata` | ✅ | Obtener datos |
| POST | `/api/userdata` | ✅ | Crear dato |
| PUT | `/api/userdata/:id` | ✅ | Actualizar dato |
| DELETE | `/api/userdata/:id` | ✅ | Eliminar dato |
| GET | `/api/userdata/types` | ✅ | Tipos disponibles |

---

### Premios (`/api/prizes`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/prizes` | ✅ | Premios del usuario |
| GET | `/api/prizes/won` | ✅ | Premios ganados |
| POST | `/api/prizes` | ✅ | Crear premio |
| PUT | `/api/prizes/:id` | ✅ | Actualizar premio |
| PUT | `/api/prizes/:id/reactivate` | ✅ | Reactivar premio |
| PUT | `/api/prizes/reactivate-all` | ✅ | Reactivar todos |
| DELETE | `/api/prizes/:id` | ✅ | Eliminar premio |

---

### Plantillas de Premio (`/api/prize-templates`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/prize-templates` | ✅ | Listar plantillas |
| GET | `/api/prize-templates/:id` | ✅ | Obtener plantilla |

---

### Compartir (`/api/share`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/share/create` | ✅ | Crear código |
| GET | `/api/share/codes` | ✅ | Códigos creados |
| GET | `/api/share/used-codes` | ✅ | Códigos usados |
| GET | `/api/share/verify/:code` | ✅ | Verificar código |
| POST | `/api/share/join` | ✅ | Unirse a juego |
| GET | `/api/share/instances` | ✅ | Instancias de juegos |
| DELETE | `/api/share/:id` | ✅ | Desactivar código |

---

### Categorías (`/api/categories`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/categories` | ✅ | Listar categorías |
| GET | `/api/categories/:id` | ✅ | Obtener categoría |

---

### Admin (`/admin`)

**Requiere rol `admin`**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/variables` | Listar variables |
| POST | `/admin/variables` | Crear variable |
| PUT | `/admin/variables/:id` | Actualizar variable |
| DELETE | `/admin/variables/:id` | Eliminar variable |
| GET | `/admin/prizes` | Listar premios (plantillas) |
| POST | `/admin/prizes` | Crear premio |
| PUT | `/admin/prizes/:id` | Actualizar premio |
| DELETE | `/admin/prizes/:id` | Eliminar premio |
| GET | `/admin/users` | Listar usuarios |
| GET | `/admin/users/:id` | Obtener usuario |
| POST | `/admin/users/:id/reset` | Reiniciar progreso |
| GET | `/admin/users/:id/userdata` | Datos del usuario |
| POST | `/admin/upload` | Subir imagen |
| GET | `/admin/stats` | Estadísticas globales |
| GET | `/admin/userdata` | Todos los datos |
| PATCH | `/admin/userdata/:id/toggle` | Activar/desactivar dato |
| GET | `/admin/categories` | Listar categorías |
| POST | `/admin/categories` | Crear categoría |
| PUT | `/admin/categories/:id` | Actualizar categoría |
| DELETE | `/admin/categories/:id` | Eliminar categoría |

---

### Otros Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ❌ | Info del API |
| GET | `/health` | ❌ | Health check |
| POST | `/api/upload` | ✅ | Subir imagen |

---

## ⚙️ Servicios

### 1. **gameset.service.js**

**Responsabilidad:** Lógica de negocio para sets de juego.

**Funciones:**

| Función | Descripción |
|---------|-------------|
| `generateNewGameSet(creatorId, playerId, shareId, shareCode)` | Genera un nuevo set con niveles aleatorios |
| `checkGameSetCompletion(gameSetId)` | Verifica si el set está completo y asigna premio |
| `resetAndGenerateNewSet(userId)` | Abandona sets activos y crea uno nuevo |
| `updateGameSetProgress(gameSetId)` | Actualiza porcentaje de progreso |

**Lógica de generación:**
1. Genera semilla aleatoria única
2. Crea GameSet en DB
3. Selecciona cantidad aleatoria de niveles (1-5)
4. Llama a `level.service` para generar niveles
5. Guarda referencias de niveles en el set

---

### 2. **level.service.js**

**Responsabilidad:** Generación de niveles a partir de datos de usuario.

**Funciones:**

| Función | Descripción |
|---------|-------------|
| `generateLevels(userId, gameSetId, seed, levelCount)` | Genera múltiples niveles |
| `createLevelFromUserData(userData, gameSetId, order)` | Crea nivel hasheando la respuesta |

**Lógica de generación:**
1. Obtiene todos los UserData activos del creador
2. Selecciona aleatoriamente (determinista) basado en seed
3. Para cada dato:
   - Genera salt único
   - Hashea la respuesta según el tipo
   - Crea el nivel con pregunta, pistas, imagen

**Tipos de hash:**
- **texto/lugar:** `SHA-256(salt + canonicalized_answer)`
- **fecha:** `SHA-256(salt + YYYY-MM-DD)`
- **foto/puzzle:** `SHA-256(salt + "1,2,3,...,n")`

---

### 3. **prize.service.js**

**Responsabilidad:** Asignación y gestión de premios.

**Funciones:**

| Función | Descripción |
|---------|-------------|
| `assignPrize(userId, seed)` | Asigna premio aleatorio ponderado |
| `selectPrizeByWeight(prizes, seed)` | Selección aleatoria ponderada |
| `getUserPrize(userId)` | Obtiene premio actual |
| `resetUserPrizes(userId)` | Marca todos como no usados |

**Algoritmo de selección ponderada:**
1. Suma todos los `weight` de premios disponibles
2. Genera número aleatorio entre 0 y suma total
3. Recorre premios acumulando weight
4. Selecciona el premio donde random <= acumulado

**Ejemplo:**
```
Premios: A(weight=3), B(weight=2), C(weight=5)
Total = 10
Random = 6.2

0──3──5────────10
   A  B    C
      ↑ (6.2 cae en C)
```

---

## 🛡️ Middlewares

### 1. **auth.middleware.js**

**Funciones:**

| Middleware | Descripción |
|------------|-------------|
| `verifyToken` | Verifica JWT en header Authorization |
| `checkRole(...roles)` | Verifica que el usuario tenga uno de los roles |
| `optionalAuth` | Verifica JWT si existe, pero no falla si no |

**Flujo de `verifyToken`:**
1. Extrae token de header `Authorization: Bearer {token}`
2. Verifica firma con `JWT_SECRET`
3. Busca usuario en DB
4. Inyecta `req.user` para siguientes middlewares
5. Si falla: retorna 401

---

### 2. **upload.middleware.js**

**Configuración de Multer:**

- **Destino:** `./uploads`
- **Nombre:** `{fieldname}-{timestamp}-{random}.{ext}`
- **Filtro:** Solo imágenes (jpeg, jpg, png, gif, webp)
- **Límite:** 5MB

---

## 🔨 Utilidades

### 1. **hash.util.js**

**Funciones de hashing:**

| Función | Propósito |
|---------|-----------|
| `generateSalt()` | Genera salt aleatorio de 16 bytes |
| `hashAnswer(answer, salt)` | Hashea respuesta de texto |
| `verifyAnswer(userAnswer, hash, salt)` | Verifica respuesta de texto |
| `hashDateAnswer(date, salt)` | Hashea fecha normalizada |
| `verifyDateAnswer(userDate, hash, salt)` | Verifica fecha |
| `hashPuzzleAnswer(grid, salt)` | Hashea orden correcto de puzzle |
| `verifyPuzzleAnswer(order, hash, salt)` | Verifica orden de puzzle |
| `canonicalizeAnswer(answer)` | Normaliza texto para comparación |

**Canonicalización:**
- Convierte a minúsculas
- Trim de espacios
- Normaliza Unicode (elimina acentos)
- "Hola Mundo" → "hola mundo"
- "Café" → "cafe"

---

### 2. **seed.util.js**

**Funciones de aleatoriedad determinista:**

| Función | Propósito |
|---------|-----------|
| `generateGameSeed()` | Genera semilla única de 64 chars hex |
| `seededRandom(seed, index)` | Genera número 0-1 determinista |
| `shuffleArray(array, seed)` | Mezcla array determinísticamente |
| `selectRandomItems(array, count, seed)` | Selecciona N elementos aleatorios |

**¿Por qué semillas deterministas?**

Permite regenerar el mismo juego con los mismos datos si se usa la misma semilla. Útil para:
- Debugging
- Reproducibilidad
- Juegos compartidos idénticos

---

## 🔄 Flujo de Datos

### Flujo Completo: Desde Registro hasta Premio

```
1. REGISTRO
   User registra → hash password → guarda en DB → retorna JWT

2. CREAR DATOS PERSONALIZADOS
   User crea UserData → almacena con pregunta, respuesta, pistas

3. GENERAR JUEGO
   User solicita juego
   ↓
   generateNewGameSet()
   ↓
   Genera seed única
   ↓
   generateLevels(userId, gameSetId, seed, count)
   ↓
   Selecciona UserData aleatorios
   ↓
   Para cada UserData:
     - Genera salt
     - Hashea respuesta
     - Crea Level
   ↓
   Retorna GameSet con niveles

4. JUGAR NIVEL
   User envía respuesta
   ↓
   verifyLevel(levelId, answer)
   ↓
   Hashea respuesta del user
   ↓
   Compara con hash almacenado
   ↓
   Si correcto:
     - Marca nivel como completed
     - Actualiza progress del GameSet
     - Verifica si todos los niveles están completos
     ↓
     Si todos completos:
       - Marca GameSet como completed
       - assignPrize(creatorId, seed)
       - Selecciona premio ponderado
       - Marca premio como usado
       - Retorna premio

5. COMPARTIR JUEGO
   User crea código compartido
   ↓
   Genera código único 6 chars
   ↓
   Otro user usa código
   ↓
   joinGame(code)
   ↓
   Genera nuevo GameSet usando datos del creador
   ↓
   Ambos juegan con las mismas preguntas
```

---

## 🔐 Autenticación y Seguridad

### Sistema de Tokens JWT

**Access Token:**
- Duración: 24 horas
- Contiene: `{ userId }`
- Firmado con: `JWT_SECRET`

**Refresh Token:**
- Duración: 7 días
- Contiene: `{ userId }`
- Firmado con: `JWT_REFRESH_SECRET`

**Flujo de Autenticación:**

```
1. Login → Genera Access + Refresh Token
2. Request con Access Token en header
3. Si Access Token expira:
   - Cliente envía Refresh Token
   - Backend genera nuevos tokens
   - Cliente actualiza tokens
```

---

### Seguridad de Respuestas

**Problema:** No se puede almacenar la respuesta correcta en texto plano.

**Solución:** Hash SHA-256 con salt

```javascript
// Al crear nivel:
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.createHash('sha256')
  .update(salt + canonicalized_answer)
  .digest('hex');

// Al verificar:
const userHash = crypto.createHash('sha256')
  .update(salt + canonicalize(userAnswer))
  .digest('hex');
return userHash === storedHash;
```

**Ventajas:**
- No se puede obtener la respuesta del hash
- Cada nivel tiene salt único
- Resistente a rainbow tables

---

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **player** | - Crear datos personalizados<br>- Generar y jugar juegos<br>- Crear y compartir códigos<br>- Gestionar sus premios |
| **admin** | - Todos los permisos de player<br>- Gestionar usuarios<br>- Gestionar variables y categorías<br>- Ver estadísticas globales<br>- Activar/desactivar datos |

---

## 🌱 Seeds y Datos Iniciales

### Script: `seed.js`

Puebla la base de datos con datos de ejemplo:

**Usuarios:**
- `admin@demo.com / admin123` (rol: admin)
- `player@demo.com / Player123` (rol: player)

**Variables:** 4 tipos (foto, fecha, lugar, texto)

**Categorías:** 8 predefinidas
- Fechas Especiales
- Lugares Memorables
- Personas Importantes
- Fotos y Recuerdos
- Datos Personales
- Música y Entretenimiento
- Comida y Bebidas
- Mascotas y Animales

**Premios Plantilla:** 10 ideas románticas

**UserData de ejemplo:** 5 datos para el player

**Ejecutar seed:**
```bash
npm run seed
```

---

## 🔧 Variables de Entorno

### Variables Requeridas

```env
# MongoDB
MONGODB_URI_DEV=mongodb://localhost:27017/duochallenge
MONGODB_URI_PRO=mongodb+srv://user:pass@cluster/db

# JWT
JWT_SECRET=tu_secret_muy_secreto_para_jwt
JWT_REFRESH_SECRET=tu_refresh_secret_muy_secreto

# URLs
API_URL_DEV=http://localhost:4000
API_URL_PRO=https://api.tudominio.com
FRONTEND_URL_DEV=http://localhost:3000
FRONTEND_URL_PRO=https://tudominio.com

# Servidor
PORT=4000
PRO=false  # true para producción

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## 🚀 Áreas de Mejora

### 1. **Seguridad**

❌ **Problemas detectados:**
- No hay rate limiting
- No hay validación robusta de inputs
- Los JWT no se invalidan al logout
- No hay blacklist de tokens

✅ **Mejoras sugeridas:**
- Implementar `express-rate-limit`
- Usar `express-validator` o `joi`
- Implementar Redis para blacklist de tokens
- Agregar 2FA opcional

---

### 2. **Performance**

❌ **Problemas detectados:**
- No hay caching
- Algunas queries sin índices
- No hay paginación en listings grandes

✅ **Mejoras sugeridas:**
- Implementar Redis para cache
- Agregar índices compuestos
- Implementar paginación en todos los GET de listas
- Usar aggregation pipelines para queries complejas

---

### 3. **Escalabilidad**

❌ **Problemas detectados:**
- Archivos subidos en filesystem local
- Sin compresión de responses
- Sin sistema de logs centralizado

✅ **Mejoras sugeridas:**
- Migrar uploads a S3/CloudStorage
- Implementar `compression` middleware
- Usar Winston + ELK Stack para logs
- Implementar health checks avanzados

---

### 4. **Testing**

❌ **Problemas detectados:**
- **No hay tests** (crítico)

✅ **Mejoras sugeridas:**
- Tests unitarios con Jest
- Tests de integración
- Tests E2E con Supertest
- Coverage mínimo del 80%

---

### 5. **Documentación**

❌ **Problemas detectados:**
- No hay Swagger/OpenAPI
- Comentarios inconsistentes (ahora resuelto)

✅ **Mejoras sugeridas:**
- Implementar Swagger UI
- Generar documentación automática
- Ejemplos de requests en Postman

---

### 6. **Código**

⚠️ **Redundancias detectadas:**

1. **Rutas duplicadas:**
   - `/api` y `/api/game` comparten el mismo router
   - **Sugerencia:** Consolidar en una sola ruta

2. **Lógica de upload duplicada:**
   - En `server.js` (línea 59)
   - En `admin.controller.js`
   - **Sugerencia:** Centralizar en un controlador

3. **Índices sin usar:**
   - `PrizeTemplate` tiene índices que no aplican:
     ```javascript
     prizeTemplateSchema.index({ userId: 1, active: 1 });
     ```
   - **Sugerencia:** Eliminar o corregir

4. **User.model hooks:**
   - Referencia a `this.roles` que no existe en el schema
   - **Sugerencia:** Limpiar código legacy

---

### 7. **Observabilidad**

❌ **Problemas detectados:**
- Logs solo en consola
- No hay métricas
- No hay alertas

✅ **Mejoras sugeridas:**
- Winston para logging estructurado
- Prometheus + Grafana para métricas
- Sentry para error tracking
- Healthchecks con detalles de DB, memoria, etc.

---

## 📊 Estadísticas del Proyecto

```
Total de Archivos: 40+
Líneas de Código: ~4,500
Modelos: 9
Controladores: 8
Rutas: 9
Servicios: 3
Middlewares: 2
Utilidades: 2
Endpoints: 60+
```

---

## 🎓 Conclusiones

### Fortalezas del Sistema

✅ **Arquitectura limpia** con separación de responsabilidades
✅ **Seguridad robusta** con hash de respuestas y JWT
✅ **Aleatoriedad determinista** permite reproducibilidad
✅ **Sistema de compartir** bien diseñado
✅ **Soft deletes** en lugar de hard deletes
✅ **Selección ponderada** de premios

### Puntos Críticos a Resolver

1. **Implementar testing**
2. **Agregar rate limiting**
3. **Migrar uploads a cloud storage**
4. **Implementar paginación**
5. **Documentar API con Swagger**

---

## 📝 Glosario

| Término | Definición |
|---------|------------|
| **GameSet** | Conjunto de niveles que forman un juego completo |
| **Level** | Desafío individual con pregunta y respuesta |
| **UserData** | Dato personalizado creado por un usuario |
| **Prize** | Premio personalizado que se asigna al completar |
| **GameShare** | Código para compartir juegos entre usuarios |
| **Seed** | Semilla aleatoria para reproducibilidad |
| **Salt** | Valor aleatorio usado en hashing |
| **Canonicalización** | Normalización de texto para comparación |

---

## 📞 Soporte

Para más información o dudas sobre el sistema, revisar:
- Código fuente con comentarios JSDoc
- Este documento de arquitectura
- Logs del servidor en desarrollo

---

**Documento generado automáticamente el 2025-10-26**
