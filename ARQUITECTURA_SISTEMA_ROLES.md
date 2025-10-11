# 🏗️ Arquitectura del Sistema DuoChallenge
## Adaptación a Tres Roles de Usuario

**Versión:** 2.0  
**Fecha:** 2025-10-11  
**Autor:** Sistema de Documentación Técnica

---

## 📋 Tabla de Contenidos

1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Arquitectura de Roles](#arquitectura-de-roles)
3. [Estructura de Colecciones MongoDB](#estructura-de-colecciones-mongodb)
4. [API Endpoints por Rol](#api-endpoints-por-rol)
5. [Flujos de Trabajo Completos](#flujos-de-trabajo-completos)
6. [Sincronización entre Aplicaciones](#sincronización-entre-aplicaciones)
7. [Seguridad y Permisos](#seguridad-y-permisos)
8. [Guía de Implementación](#guía-de-implementación)

---

## 1. Visión General del Sistema

### 1.1 Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA DUOCHALLENGE                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   BACKOFFICE │  │   BACKEND    │  │    MOBILE    │      │
│  │   (React)    │──│  (Node.js)   │──│(React Native)│      │
│  │              │  │              │  │              │      │
│  │ Admin Panel  │  │  REST API    │  │  iOS/Android │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                            │                                  │
│                    ┌───────▼───────┐                         │
│                    │   MongoDB     │                         │
│                    │   Database    │                         │
│                    └───────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológico

| Componente | Tecnologías |
|------------|-------------|
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt |
| **Mobile** | React Native, Expo, Axios, AsyncStorage |
| **Backoffice** | React, Vite, TanStack Query, Axios |
| **Base de Datos** | MongoDB Atlas |
| **Autenticación** | JWT (Access Token + Refresh Token) |
| **Storage** | File System (Local) + MongoDB GridFS (Futuro) |

---

## 2. Arquitectura de Roles

### 2.1 Definición de Roles

```javascript
// Roles del sistema
const ROLES = {
  ADMIN: 'admin',      // Administrador del sistema
  CREATOR: 'creator',  // Creador de contenido personalizado
  PLAYER: 'player'     // Jugador que usa código compartido
};
```

### 2.2 Matriz de Permisos y Responsabilidades

| Función | Admin | Creator | Player |
|---------|-------|---------|--------|
| **Gestión de Plantillas** | ✅ CRUD | ❌ Solo lectura | ❌ No acceso |
| **Gestión de Categorías** | ✅ CRUD | ❌ Solo lectura | ❌ No acceso |
| **Premios por Defecto** | ✅ CRUD | ❌ No acceso | ❌ No acceso |
| **Datos Personales** | ❌ No acceso | ✅ CRUD propios | ❌ No acceso |
| **Premios Personalizados** | ❌ No acceso | ✅ CRUD propios | ❌ No acceso |
| **Generar Código** | ❌ No acceso | ✅ Crear/Ver | ❌ No acceso |
| **Usar Código** | ❌ No acceso | ❌ No acceso | ✅ Unirse |
| **Jugar Partida** | ❌ No acceso | ✅ Propia | ✅ Con código |
| **Ver Estadísticas Globales** | ✅ Todas | ❌ Propias | ❌ Propias |

### 2.3 Casos de Uso por Rol

#### 👑 Administrador

**Objetivo:** Configurar y mantener el sistema global

**Acceso:** Solo desde **Backoffice**

**Funcionalidades:**
- Define categorías de desafíos (Romántico, Aventura, Conocimiento, etc.)
- Crea plantillas de niveles (LevelTemplates)
- Configura plantillas de desafíos (ChallengeTemplates)
- Define premios por defecto del sistema
- Gestiona variables globales para plantillas
- Visualiza estadísticas del sistema
- Administra usuarios (CRUD)

#### 🎨 Creador

**Objetivo:** Personalizar juego y compartirlo con su pareja

**Acceso:** **Mobile App** (principalmente) y **Backoffice** (opcional)

**Funcionalidades:**
- Sube datos personales:
  - Fotos de momentos especiales
  - Fechas importantes (aniversario, primera cita, etc.)
  - Lugares significativos
  - Nombres, apodos, frases especiales
- Crea premios personalizados para su pareja
- Genera código de compartición único
- Ve quién ha usado su código
- Puede jugar su propio juego (modo prueba)
- Edita/actualiza sus datos en cualquier momento

#### 🎮 Jugador

**Objetivo:** Jugar el juego personalizado por su pareja

**Acceso:** **Mobile App**

**Funcionalidades:**
- Ingresa código compartido por el creador
- Juega niveles con desafíos basados en datos del creador
- Responde preguntas sobre momentos compartidos
- Recibe pistas si falla
- Desbloquea premios personalizados al completar niveles
- Ve su progreso en tiempo real

---

## 3. Estructura de Colecciones MongoDB

### 3.1 Diagrama de Relaciones

```
┌──────────────┐
│    Users     │
│ (role field) │
└──────┬───────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌──────────────┐                         ┌──────────────┐
│  UserData    │                         │  Prizes      │
│  (creator)   │                         │(creator/def) │
└──────────────┘                         └──────────────┘
       │                                         │
       │                                         │
       ▼                                         │
┌──────────────┐      ┌──────────────┐         │
│  GameShare   │      │ GameInstance │         │
│  (creator)   │──────│   (player)   │         │
└──────────────┘      └──────┬───────┘         │
                             │                  │
                             ▼                  │
                      ┌──────────────┐         │
                      │   GameSet    │◄────────┘
                      │              │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │    Levels    │
                      │              │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Challenges  │
                      │              │
                      └──────────────┘

PLANTILLAS (Admin):
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Categories  │      │LevelTemplate │      │ChallengeTemp │
│              │──────│              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

### 3.2 Colecciones Detalladas

#### 3.2.1 👤 Users (Usuarios)

```javascript
{
  _id: ObjectId,
  name: String,              // Nombre del usuario
  email: String,             // Email único
  passwordHash: String,      // Contraseña hasheada
  role: String,              // 'admin' | 'creator' | 'player'
  
  // Estado del juego (para jugadores propios)
  currentSetId: ObjectId,    // Ref: GameSet (juego activo)
  completedChallenges: [ObjectId],  // Refs: Challenge
  completedLevels: [ObjectId],      // Refs: Level
  currentPrizeId: ObjectId,  // Ref: Prize (premio actual)
  totalSetsCompleted: Number,
  
  // Instancias de juego (como jugador)
  activeGameInstances: [ObjectId],  // Refs: GameInstance
  
  timestamps: true
}
```

**Índices:**
```javascript
{ email: 1 } // unique
{ role: 1 }
```

#### 3.2.2 📊 UserData (Datos Personales del Creador)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: User (el creador)
  tipoDato: String,          // 'nombre', 'foto', 'fecha', 'lugar', etc.
  valor: String,             // El valor real (o path si es imagen)
  pregunta: String,          // "¿Cuál es mi segundo nombre?"
  pistas: [String],          // ["Empieza con M", "Es de 5 letras"]
  categorias: [String],      // ['romántico', 'personal']
  imagePath: String,         // "/uploads/user123/foto1.jpg"
  active: Boolean,           // true = disponible para juego
  
  timestamps: true
}
```

**Índices:**
```javascript
{ userId: 1, tipoDato: 1 }
{ userId: 1, active: 1 }
```

**Ejemplo de Datos:**
```javascript
// Dato tipo "fecha"
{
  userId: "607f1f77bcf86cd799439011",
  tipoDato: "fecha_aniversario",
  valor: "2020-05-15",
  pregunta: "¿Cuándo fue nuestra primera cita?",
  pistas: [
    "Fue en primavera",
    "Era un viernes",
    "Mayo de 2020"
  ],
  categorias: ["romántico"],
  active: true
}

// Dato tipo "foto"
{
  userId: "607f1f77bcf86cd799439011",
  tipoDato: "foto_viaje",
  valor: "Paris",
  pregunta: "¿En qué ciudad tomamos esta foto?",
  pistas: [
    "Europa",
    "La ciudad del amor",
    "Torre Eiffel"
  ],
  imagePath: "/uploads/user123/paris.jpg",
  categorias: ["viajes", "recuerdos"],
  active: true
}
```

#### 3.2.3 🏆 Prizes (Premios)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: User (null = premio del sistema)
  title: String,             // "Cena romántica"
  description: String,       // "Una cena en tu restaurante favorito"
  imagePath: String,         // "/uploads/prizes/dinner.jpg"
  isDefault: Boolean,        // true = premio del sistema (admin)
  
  // Control de uso
  used: Boolean,             // false = disponible, true = ya entregado
  usedBy: ObjectId,          // Ref: User (quien lo recibió)
  usedAt: Date,              // Fecha de entrega
  
  // Configuración
  weight: Number,            // 1-10 (probabilidad de selección)
  category: String,          // 'romántico', 'aventura', 'dulce'
  active: Boolean,
  
  timestamps: true
}
```

**Índices:**
```javascript
{ userId: 1, active: 1 }
{ isDefault: 1, active: 1 }
{ used: 1, active: 1 }
```

**Tipos de Premios:**
- **Premios del Sistema (isDefault: true, userId: null)**: Creados por admin
- **Premios Personalizados (isDefault: false, userId: X)**: Creados por creadores

#### 3.2.4 🔗 GameShare (Códigos de Compartición)

```javascript
{
  _id: ObjectId,
  creatorId: ObjectId,       // Ref: User (quien creó el código)
  code: String,              // "AB12CD" (6 caracteres, único)
  active: Boolean,           // true = válido, false = desactivado
  
  // Registro de usos
  usedBy: [{
    userId: ObjectId,        // Ref: User (quien usó el código)
    joinedAt: Date           // Cuándo se unió
  }],
  
  // Límites opcionales
  maxUses: Number,           // null = ilimitado
  expiresAt: Date,           // null = no expira
  
  timestamps: true
}
```

**Índices:**
```javascript
{ code: 1 } // unique
{ creatorId: 1, active: 1 }
```

#### 3.2.5 🎮 GameInstance (Instancia de Juego)

```javascript
{
  _id: ObjectId,
  playerId: ObjectId,        // Ref: User (quien juega)
  creatorId: ObjectId,       // Ref: User (quien creó el contenido)
  shareCode: String,         // Código usado para unirse
  
  // Estado del juego
  currentSetId: ObjectId,    // Ref: GameSet (set activo)
  completedSets: Number,     // Contador de sets completados
  active: Boolean,           // true = partida activa
  
  // Progreso específico de esta instancia
  completedChallenges: [ObjectId],  // Refs: Challenge
  completedLevels: [ObjectId],      // Refs: Level
  currentPrizeId: ObjectId,  // Ref: Prize
  
  timestamps: true
}
```

**Índices:**
```javascript
{ playerId: 1, active: 1 }
{ creatorId: 1 }
{ playerId: 1, creatorId: 1, shareCode: 1 }
```

**Nota Importante:** Una GameInstance representa una partida única entre un jugador y los datos de un creador específico. Un usuario puede tener múltiples instancias activas si juega con diferentes creadores.

#### 3.2.6 📦 GameSet (Set de Juego)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Ref: User (a quién pertenece el progreso)
  gameInstanceId: ObjectId,  // Ref: GameInstance (null si es juego propio)
  
  levels: [ObjectId],        // Refs: Level (3-5 niveles)
  seed: String,              // Semilla para reproducibilidad
  prizeId: ObjectId,         // Ref: Prize (premio al completar)
  
  completed: Boolean,
  completedAt: Date,
  active: Boolean,           // Solo un set activo por instancia
  
  timestamps: true
}
```

**Índices:**
```javascript
{ userId: 1, active: 1 }
{ gameInstanceId: 1, active: 1 }
```

#### 3.2.7 🎯 Level (Nivel)

```javascript
{
  _id: ObjectId,
  title: String,             // "Recuerdos de París"
  description: String,       // "Responde sobre nuestro viaje"
  order: Number,             // 1, 2, 3... (orden en el set)
  
  challenges: [ObjectId],    // Refs: Challenge (3-5 retos)
  userId: ObjectId,          // Ref: User (jugador)
  gameSetId: ObjectId,       // Ref: GameSet
  
  completed: Boolean,
  completedAt: Date,
  
  timestamps: true
}
```

#### 3.2.8 ⚔️ Challenge (Desafío)

```javascript
{
  _id: ObjectId,
  type: String,              // 'date_guess' | 'riddle' | 'photo_puzzle' | 'location' | 'question'
  question: String,          // "¿En qué fecha fue nuestra primera cita?"
  hints: [String],           // Pistas progresivas
  
  // Seguridad
  answerHash: String,        // Hash de la respuesta correcta
  salt: String,              // Salt para el hash
  
  imagePath: String,         // Imagen opcional
  maxAttempts: Number,       // 5 por defecto
  currentAttempts: Number,   // Contador
  
  levelId: ObjectId,         // Ref: Level
  userId: ObjectId,          // Ref: User (jugador)
  
  completed: Boolean,
  completedAt: Date,
  order: Number,
  
  timestamps: true
}
```

**Índices:**
```javascript
{ levelId: 1, order: 1 }
{ userId: 1, completed: 1 }
```

---

### 3.3 Colecciones de Plantillas (Admin)

#### 3.3.1 📁 Categories (Categorías)

```javascript
{
  _id: ObjectId,
  name: String,              // "Romántico", "Aventura", "Conocimiento"
  description: String,
  active: Boolean,
  
  timestamps: true
}
```

#### 3.3.2 📋 LevelTemplate (Plantilla de Nivel)

```javascript
{
  _id: ObjectId,
  name: String,              // "Nivel de Fechas Importantes"
  description: String,
  categoryId: ObjectId,      // Ref: Category
  dataType: String,          // 'nombre' | 'foto' | 'fecha' | 'lugar' | etc.
  challengesPerLevel: Number, // 3 por defecto
  difficulty: String,        // 'easy' | 'medium' | 'hard'
  order: Number,
  active: Boolean,
  
  timestamps: true
}
```

**Índices:**
```javascript
{ categoryId: 1, dataType: 1 }
{ active: 1, order: 1 }
```

#### 3.3.3 🎲 ChallengeTemplate (Plantilla de Desafío)

```javascript
{
  _id: ObjectId,
  type: String,              // 'date_guess' | 'riddle' | 'photo_puzzle' | etc.
  title: String,             // "Adivina la Fecha"
  questionTemplate: String,  // "¿Cuándo fue {evento}?"
  variables: [String],       // ['evento', 'lugar']
  hintsTemplate: [String],   // ["Fue en {mes}", "Era un {diaSemana}"]
  difficulty: String,
  category: String,
  active: Boolean,
  
  timestamps: true
}
```

**Ejemplo de Template:**
```javascript
{
  type: "date_guess",
  title: "Adivina la Fecha Especial",
  questionTemplate: "¿Cuándo fue {evento}?",
  variables: ["evento"],
  hintsTemplate: [
    "Fue en {mes}",
    "Era un {diaSemana}",
    "En el año {año}"
  ],
  difficulty: "medium",
  category: "romántico"
}
```

---

## 4. API Endpoints por Rol

### 4.1 Organización de Rutas

```
/auth          - Autenticación (público/protegido)
/api           - Endpoints de juego (protegido)
/api/userdata  - Datos personales (protegido, creator)
/api/prizes    - Premios personalizados (protegido, creator)
/api/share     - Códigos y compartición (protegido)
/admin         - Panel de administración (protegido, admin)
```

### 4.2 Endpoints de Autenticación

#### POST /auth/register
**Acceso:** Público  
**Rol Creado:** Por defecto 'player', puede especificar 'creator'

```javascript
// Request
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "SecurePass123",
  "role": "creator" // opcional
}

// Response 201
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "_id": "607f1f77bcf86cd799439011",
      "name": "María García",
      "email": "maria@example.com",
      "role": "creator"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/login
**Acceso:** Público

```javascript
// Request
{
  "email": "maria@example.com",
  "password": "SecurePass123"
}

// Response 200
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { /*...*/ },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/refresh
**Acceso:** Público (con refresh token)

```javascript
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### GET /auth/profile
**Acceso:** Protegido (cualquier rol)

```javascript
// Response 200
{
  "success": true,
  "data": {
    "user": {
      "_id": "607f1f77bcf86cd799439011",
      "name": "María García",
      "email": "maria@example.com",
      "role": "creator",
      "currentSetId": "...",
      "totalSetsCompleted": 5
    }
  }
}
```

---

### 4.3 Endpoints del Creador

#### 📝 Gestión de Datos Personales

##### GET /api/userdata
**Rol:** Creator  
**Descripción:** Obtener todos los datos personales del usuario

```javascript
// Response 200
{
  "success": true,
  "data": {
    "userdata": [
      {
        "_id": "...",
        "tipoDato": "fecha_aniversario",
        "valor": "2020-05-15",
        "pregunta": "¿Cuándo fue nuestra primera cita?",
        "pistas": ["Fue en primavera", "Era un viernes"],
        "categorias": ["romántico"],
        "active": true
      },
      // ... más datos
    ]
  }
}
```

##### POST /api/userdata
**Rol:** Creator  
**Descripción:** Crear nuevo dato personal

```javascript
// Request
{
  "tipoDato": "lugar_especial",
  "valor": "Parque Central",
  "pregunta": "¿Dónde nos conocimos?",
  "pistas": [
    "Es un lugar público",
    "Tiene muchos árboles",
    "Está en el centro de la ciudad"
  ],
  "categorias": ["recuerdos", "romántico"]
}

// Response 201
{
  "success": true,
  "message": "Dato creado exitosamente",
  "data": {
    "userdata": { /*...*/ }
  }
}
```

##### PUT /api/userdata/:id
**Rol:** Creator (solo propios datos)

```javascript
// Request
{
  "pregunta": "¿Dónde nos vimos por primera vez?",
  "pistas": ["Era un sábado", "Hacía sol"]
}

// Response 200
{
  "success": true,
  "message": "Dato actualizado",
  "data": { /*...*/ }
}
```

##### DELETE /api/userdata/:id
**Rol:** Creator (solo propios datos)

```javascript
// Response 200
{
  "success": true,
  "message": "Dato eliminado"
}
```

#### 🏆 Gestión de Premios Personalizados

##### GET /api/prizes
**Rol:** Creator  
**Descripción:** Obtener premios del usuario

```javascript
// Response 200
{
  "success": true,
  "data": {
    "prizes": [
      {
        "_id": "...",
        "title": "Cena romántica",
        "description": "Una cena en tu restaurante favorito",
        "imagePath": "/uploads/prizes/dinner.jpg",
        "used": false,
        "weight": 8,
        "category": "romántico"
      },
      // ... más premios
    ]
  }
}
```

##### POST /api/prizes
**Rol:** Creator

```javascript
// Request
{
  "title": "Fin de semana en la playa",
  "description": "Dos días de descanso en el mar",
  "category": "aventura",
  "weight": 10
}

// Response 201
{
  "success": true,
  "message": "Premio creado exitosamente",
  "data": {
    "prize": { /*...*/ }
  }
}
```

##### PUT /api/prizes/:id
**Rol:** Creator (solo propios premios)

##### DELETE /api/prizes/:id
**Rol:** Creator (solo propios premios no usados)

#### 🔗 Gestión de Códigos de Compartición

##### POST /api/share/create
**Rol:** Creator  
**Descripción:** Generar código para compartir con la pareja

```javascript
// Request (body vacío o con opciones)
{
  "maxUses": 1,              // opcional
  "expiresAt": "2025-12-31"  // opcional
}

// Response 201
{
  "success": true,
  "message": "Código generado exitosamente",
  "data": {
    "gameShare": {
      "_id": "...",
      "code": "AB12CD",
      "creatorId": "...",
      "active": true,
      "usedBy": []
    }
  }
}
```

##### GET /api/share/my-codes
**Rol:** Creator  
**Descripción:** Ver todos los códigos creados

```javascript
// Response 200
{
  "success": true,
  "data": {
    "shareCodes": [
      {
        "_id": "...",
        "code": "AB12CD",
        "active": true,
        "usedBy": [
          {
            "userId": {
              "_id": "...",
              "name": "Carlos López",
              "email": "carlos@example.com"
            },
            "joinedAt": "2025-10-10T15:30:00.000Z"
          }
        ],
        "createdAt": "2025-10-01T10:00:00.000Z"
      }
    ]
  }
}
```

##### DELETE /api/share/deactivate/:id
**Rol:** Creator  
**Descripción:** Desactivar un código

---

### 4.4 Endpoints del Jugador

#### 🔍 Unirse a un Juego

##### GET /api/share/verify/:code
**Rol:** Player  
**Descripción:** Verificar si un código es válido

```javascript
// Request: GET /api/share/verify/AB12CD

// Response 200
{
  "success": true,
  "data": {
    "creator": {
      "_id": "...",
      "name": "María García",
      "email": "maria@example.com"
    },
    "code": "AB12CD"
  }
}
```

##### POST /api/share/join
**Rol:** Player  
**Descripción:** Unirse a un juego usando un código

```javascript
// Request
{
  "code": "AB12CD"
}

// Response 200
{
  "success": true,
  "message": "Te has unido al juego exitosamente",
  "data": {
    "gameInstance": {
      "_id": "...",
      "playerId": "...",
      "creatorId": "...",
      "shareCode": "AB12CD",
      "currentSetId": "...",
      "active": true
    }
  }
}
```

##### GET /api/share/my-instances
**Rol:** Player  
**Descripción:** Obtener todas las instancias de juego activas

```javascript
// Response 200
{
  "success": true,
  "data": {
    "instances": [
      {
        "_id": "...",
        "creatorId": {
          "_id": "...",
          "name": "María García"
        },
        "currentSetId": { /*...*/ },
        "completedSets": 2,
        "active": true
      }
    ]
  }
}
```

#### 🎮 Jugar

##### POST /api/generate
**Rol:** Player/Creator  
**Descripción:** Generar nuevo set de juego

```javascript
// Request (body vacío)
{}

// Response 200
{
  "success": true,
  "message": "Set de juego generado exitosamente",
  "data": {
    "gameSet": {
      "_id": "...",
      "levels": [ /*...*/ ],
      "seed": "abc123xyz",
      "active": true
    }
  }
}
```

##### GET /api/levels
**Rol:** Player/Creator  
**Descripción:** Obtener niveles del juego actual

```javascript
// Response 200
{
  "success": true,
  "data": {
    "levels": [
      {
        "_id": "...",
        "title": "Recuerdos Románticos",
        "description": "Responde sobre momentos especiales",
        "order": 1,
        "challenges": [
          {
            "_id": "...",
            "type": "date_guess",
            "question": "¿Cuándo fue nuestra primera cita?",
            "imagePath": null,
            "completed": false,
            "maxAttempts": 5,
            "currentAttempts": 0
          },
          // ... más challenges
        ],
        "completed": false
      },
      // ... más niveles
    ]
  }
}
```

##### GET /api/challenge/:challengeId
**Rol:** Player/Creator  
**Descripción:** Obtener detalles de un desafío específico

```javascript
// Response 200
{
  "success": true,
  "data": {
    "challenge": {
      "_id": "...",
      "type": "date_guess",
      "question": "¿Cuándo fue nuestra primera cita?",
      "hints": [
        "Fue en primavera",
        "Era un viernes",
        "Mayo de 2020"
      ],
      "imagePath": null,
      "maxAttempts": 5,
      "currentAttempts": 1,
      "completed": false
      // NOTA: No se envían answerHash ni salt al cliente
    }
  }
}
```

##### POST /api/challenge/:challengeId/verify
**Rol:** Player/Creator  
**Descripción:** Verificar respuesta de un desafío

```javascript
// Request
{
  "answer": "2020-05-15"
}

// Response 200 - Respuesta correcta
{
  "success": true,
  "correct": true,
  "message": "¡Respuesta correcta!",
  "levelCompleted": false,
  "gameCompleted": false
}

// Response 200 - Respuesta incorrecta
{
  "success": true,
  "correct": false,
  "message": "Respuesta incorrecta",
  "attemptsLeft": 4,
  "hint": "Fue en primavera"
}

// Response 200 - Nivel completado
{
  "success": true,
  "correct": true,
  "message": "¡Respuesta correcta! Nivel completado",
  "levelCompleted": true,
  "gameCompleted": false
}

// Response 200 - Juego completado
{
  "success": true,
  "correct": true,
  "message": "¡Respuesta correcta!",
  "levelCompleted": true,
  "gameCompleted": true,
  "prize": {
    "_id": "...",
    "title": "Cena romántica",
    "description": "Una cena en tu restaurante favorito",
    "imagePath": "/uploads/prizes/dinner.jpg"
  }
}
```

##### GET /api/progress
**Rol:** Player/Creator  
**Descripción:** Obtener progreso actual

```javascript
// Response 200
{
  "success": true,
  "data": {
    "hasActiveGame": true,
    "progress": 60,              // Porcentaje
    "totalChallenges": 15,
    "completedChallenges": 9,
    "completedLevels": 2,
    "totalSetsCompleted": 3,
    "currentPrize": null
  }
}
```

##### GET /api/prize
**Rol:** Player/Creator  
**Descripción:** Obtener premio actual (si completó el set)

```javascript
// Response 200
{
  "success": true,
  "data": {
    "prize": {
      "_id": "...",
      "title": "Fin de semana en la playa",
      "description": "Dos días de descanso en el mar",
      "imagePath": "/uploads/prizes/beach.jpg",
      "category": "aventura"
    }
  }
}
```

##### POST /api/reset
**Rol:** Player/Creator  
**Descripción:** Reiniciar juego y generar nuevo set

```javascript
// Response 200
{
  "success": true,
  "message": "Nuevo set de juego generado",
  "data": {
    "gameSet": { /*...*/ }
  }
}
```

---

### 4.5 Endpoints del Administrador

#### 📁 Gestión de Categorías

##### GET /admin/categories
**Rol:** Admin

```javascript
// Response 200
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Romántico",
        "description": "Desafíos sobre momentos románticos",
        "active": true
      },
      // ...
    ]
  }
}
```

##### POST /admin/categories
**Rol:** Admin

```javascript
// Request
{
  "name": "Aventura",
  "description": "Desafíos sobre experiencias y viajes"
}

// Response 201
{
  "success": true,
  "data": { /*...*/ }
}
```

##### PUT /admin/categories/:id
**Rol:** Admin

##### DELETE /admin/categories/:id
**Rol:** Admin

#### 📋 Gestión de Plantillas de Nivel

##### GET /admin/level-templates
**Rol:** Admin

```javascript
// Response 200
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "...",
        "name": "Nivel de Fechas",
        "description": "Desafíos sobre fechas importantes",
        "categoryId": { "_id": "...", "name": "Romántico" },
        "dataType": "fecha",
        "challengesPerLevel": 3,
        "difficulty": "medium",
        "active": true
      },
      // ...
    ]
  }
}
```

##### POST /admin/level-templates
**Rol:** Admin

```javascript
// Request
{
  "name": "Nivel de Fotos",
  "description": "Desafíos basados en fotos especiales",
  "categoryId": "607f1f77bcf86cd799439011",
  "dataType": "foto",
  "challengesPerLevel": 4,
  "difficulty": "easy"
}
```

##### PUT /admin/level-templates/:id
**Rol:** Admin

##### DELETE /admin/level-templates/:id
**Rol:** Admin

#### 🎲 Gestión de Plantillas de Desafíos

##### GET /admin/templates
**Rol:** Admin

```javascript
// Response 200
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "...",
        "type": "date_guess",
        "title": "Adivina la Fecha",
        "questionTemplate": "¿Cuándo fue {evento}?",
        "variables": ["evento"],
        "hintsTemplate": [
          "Fue en {mes}",
          "Era un {diaSemana}"
        ],
        "difficulty": "medium",
        "active": true
      },
      // ...
    ]
  }
}
```

##### POST /admin/templates
**Rol:** Admin

```javascript
// Request
{
  "type": "location",
  "title": "¿Dónde fue?",
  "questionTemplate": "¿En qué lugar {accion}?",
  "variables": ["accion", "lugar"],
  "hintsTemplate": [
    "Fue en {ciudad}",
    "Es un lugar {tipo}"
  ],
  "difficulty": "easy",
  "category": "recuerdos"
}
```

#### 🏆 Gestión de Premios por Defecto

##### GET /admin/prizes
**Rol:** Admin  
**Descripción:** Ver premios del sistema

```javascript
// Response 200
{
  "success": true,
  "data": {
    "prizes": [
      {
        "_id": "...",
        "title": "Masaje de parejas",
        "description": "Una sesión de masajes relajantes",
        "isDefault": true,
        "userId": null,
        "weight": 7,
        "active": true
      },
      // ...
    ]
  }
}
```

##### POST /admin/prizes
**Rol:** Admin

```javascript
// Request
{
  "title": "Clase de cocina",
  "description": "Aprendan a cocinar juntos",
  "category": "experiencia",
  "weight": 8
}
```

#### 👥 Gestión de Usuarios

##### GET /admin/users
**Rol:** Admin

```javascript
// Response 200
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "María García",
        "email": "maria@example.com",
        "role": "creator",
        "totalSetsCompleted": 5,
        "createdAt": "2025-09-15T10:00:00.000Z"
      },
      // ...
    ]
  }
}
```

##### PUT /admin/users/:id
**Rol:** Admin  
**Descripción:** Actualizar usuario (cambiar rol, etc.)

##### DELETE /admin/users/:id
**Rol:** Admin  
**Descripción:** Eliminar usuario

#### 📊 Estadísticas

##### GET /admin/stats
**Rol:** Admin

```javascript
// Response 200
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "usersByRole": {
      "admin": 2,
      "creator": 75,
      "player": 73
    },
    "totalGames": 450,
    "activeGames": 120,
    "completedGames": 330,
    "totalChallenges": 6750,
    "totalPrizes": 225,
    "prizesUsed": 150
  }
}
```

#### 📤 Upload de Archivos

##### POST /admin/upload
**Rol:** Admin  
**Descripción:** Subir imagen para premio del sistema

```javascript
// Request: multipart/form-data
// Campo: image (file)

// Response 200
{
  "success": true,
  "data": {
    "imagePath": "/uploads/admin/premio_123.jpg",
    "filename": "premio_123.jpg"
  }
}
```

---

## 5. Flujos de Trabajo Completos

### 5.1 Flujo Completo: Creador Configura y Comparte

```
┌──────────────────────────────────────────────────────────────┐
│  FLUJO DEL CREADOR: Desde Registro hasta Código Compartido  │
└──────────────────────────────────────────────────────────────┘

1. REGISTRO
   Usuario: María
   ├─ POST /auth/register
   │  { "email": "maria@example.com", "role": "creator" }
   └─ ✅ Token JWT + userId

2. SUBIR DATOS PERSONALES
   ├─ POST /api/userdata (x5)
   │  ┌─ Dato 1: Primera cita (fecha)
   │  ├─ Dato 2: Lugar de conocerse
   │  ├─ Dato 3: Apodo especial
   │  ├─ Dato 4: Foto de viaje a París
   │  └─ Dato 5: Restaurante favorito
   └─ ✅ 5 UserData creados

3. CREAR PREMIOS PERSONALIZADOS
   ├─ POST /api/prizes (x3)
   │  ┌─ Premio 1: Cena romántica
   │  ├─ Premio 2: Fin de semana en la playa
   │  └─ Premio 3: Sesión de fotos
   └─ ✅ 3 Premios creados

4. GENERAR CÓDIGO PARA COMPARTIR
   ├─ POST /api/share/create
   └─ ✅ Código: "AB12CD"

5. COMPARTIR CÓDIGO
   ├─ María comparte "AB12CD" con Carlos
   └─ (Por WhatsApp, SMS, etc.)

6. [OPCIONAL] PROBAR JUEGO
   ├─ POST /api/generate
   │  (María puede jugar su propio juego como prueba)
   └─ ✅ GameSet generado
```

### 5.2 Flujo Completo: Jugador Se Une y Juega

```
┌──────────────────────────────────────────────────────────────┐
│  FLUJO DEL JUGADOR: Desde Código hasta Premio                │
└──────────────────────────────────────────────────────────────┘

1. REGISTRO
   Usuario: Carlos
   ├─ POST /auth/register
   │  { "email": "carlos@example.com", "role": "player" }
   └─ ✅ Token JWT + userId

2. VERIFICAR CÓDIGO
   ├─ GET /api/share/verify/AB12CD
   └─ ✅ Código válido, creador: María García

3. UNIRSE AL JUEGO
   ├─ POST /api/share/join
   │  { "code": "AB12CD" }
   │
   │  Backend:
   │  ├─ Crea GameInstance (Carlos + María)
   │  ├─ Llama generateNewGameSet(creatorId=María, instanceId=...)
   │  │  ├─ Obtiene UserData de MARÍA (5 datos)
   │  │  ├─ Genera 3 Levels
   │  │  │  ├─ Level 1: "Recuerdos Románticos" (3 challenges)
   │  │  │  ├─ Level 2: "Lugares Especiales" (3 challenges)
   │  │  │  └─ Level 3: "Momentos Únicos" (3 challenges)
   │  │  └─ Crea GameSet con levels
   │  └─ Actualiza GameInstance.currentSetId
   │
   └─ ✅ GameInstance + GameSet creados

4. OBTENER NIVELES
   ├─ GET /api/levels
   └─ ✅ 3 Levels con 9 Challenges total

5. JUGAR NIVEL 1
   ┌─ Challenge 1: "¿Cuándo fue nuestra primera cita?"
   │  ├─ GET /api/challenge/:id
   │  ├─ Carlos responde: "2020-05-15"
   │  ├─ POST /api/challenge/:id/verify
   │  │  { "answer": "2020-05-15" }
   │  └─ ✅ Correcto!
   │
   ├─ Challenge 2: "¿Dónde nos conocimos?"
   │  ├─ Carlos responde mal: "En el cine"
   │  ├─ POST /api/challenge/:id/verify
   │  ├─ ❌ Incorrecto (intentos: 1/5)
   │  ├─ 💡 Pista: "Es un lugar público"
   │  ├─ Carlos responde: "Parque Central"
   │  └─ ✅ Correcto!
   │
   └─ Challenge 3: "¿Cuál es mi apodo especial?"
      ├─ Carlos responde: "Marita"
      └─ ✅ Correcto! → NIVEL 1 COMPLETADO

6. JUGAR NIVEL 2 y 3
   ├─ [Similar al Nivel 1]
   └─ ✅ Todos los niveles completados

7. RECIBIR PREMIO
   Backend:
   ├─ checkGameSetCompletion()
   │  ├─ Todos los levels completados ✅
   │  ├─ assignPrize() → Selecciona premio aleatorio
   │  │  (De premios de María + premios del sistema)
   │  └─ Premio asignado: "Cena romántica"
   │
   ├─ GET /api/prize
   └─ ✅ Premio mostrado en app

8. [OPCIONAL] JUGAR NUEVO SET
   ├─ POST /api/reset
   │  ├─ Desactiva GameSet anterior
   │  └─ Genera nuevo GameSet con datos diferentes
   └─ ✅ Nuevo juego listo
```

### 5.3 Flujo del Administrador

```
┌──────────────────────────────────────────────────────────────┐
│  FLUJO DEL ADMIN: Configuración Inicial del Sistema          │
└──────────────────────────────────────────────────────────────┘

1. LOGIN ADMIN
   ├─ POST /auth/login
   │  { "email": "admin@duochallenge.com", "password": "..." }
   └─ ✅ Token JWT (role: admin)

2. CREAR CATEGORÍAS
   ├─ POST /admin/categories (x4)
   │  ┌─ "Romántico"
   │  ├─ "Aventura"
   │  ├─ "Conocimiento"
   │  └─ "Diversión"
   └─ ✅ 4 Categorías creadas

3. CREAR PLANTILLAS DE NIVEL
   ├─ POST /admin/level-templates (x6)
   │  ┌─ Template 1: Nivel de Fechas (dataType: fecha)
   │  ├─ Template 2: Nivel de Fotos (dataType: foto)
   │  ├─ Template 3: Nivel de Lugares (dataType: lugar)
   │  ├─ Template 4: Nivel de Nombres (dataType: nombre)
   │  ├─ Template 5: Nivel de Textos (dataType: texto)
   │  └─ Template 6: Nivel Mixto (dataType: otro)
   └─ ✅ 6 LevelTemplates creados

4. CREAR PLANTILLAS DE DESAFÍOS
   ├─ POST /admin/templates (x10)
   │  ┌─ "Adivina la Fecha"
   │  ├─ "¿Dónde fue?"
   │  ├─ "Completa la Frase"
   │  ├─ "¿Quién dijo?"
   │  └─ ... (6 más)
   └─ ✅ 10 ChallengeTemplates creados

5. CREAR PREMIOS POR DEFECTO
   ├─ POST /admin/prizes (x15)
   │  ┌─ "Masaje de parejas"
   │  ├─ "Clase de cocina"
   │  ├─ "Cine y cena"
   │  └─ ... (12 más)
   └─ ✅ 15 Premios del sistema

6. MONITOREAR ESTADÍSTICAS
   ├─ GET /admin/stats
   └─ ✅ Dashboard con métricas

7. GESTIONAR USUARIOS
   ├─ GET /admin/users
   └─ ✅ Lista de todos los usuarios
```

### 5.4 Diagrama de Flujo: Generación de Juego

```
generateNewGameSet(creatorId, gameInstanceId)
│
├─ 1. Generar seed único
│     seed = generateGameSeed() // "abc123xyz"
│
├─ 2. Determinar targetUserId
│     if (gameInstanceId) {
│       targetUserId = GameInstance.playerId // Carlos
│     } else {
│       targetUserId = creatorId // María
│     }
│
├─ 3. Desactivar set anterior
│     GameSet.updateMany({ ... }, { active: false })
│
├─ 4. Crear nuevo GameSet
│     gameSet = new GameSet({
│       userId: targetUserId,     // Carlos (o María si juega sola)
│       gameInstanceId: ...,      // Ref a instancia
│       seed: "abc123xyz",
│       levels: [],
│       active: true
│     })
│
├─ 5. Generar Niveles (usando datos del CREADOR)
│     generateLevels(creatorId=María, gameSetId, seed, numLevels=3)
│     │
│     ├─ A. Obtener UserData del creador (María)
│     │    userdata = UserData.find({ userId: María, active: true })
│     │    // Resultado: 5 datos
│     │
│     ├─ B. Agrupar por tipoDato
│     │    {
│     │      'fecha': [dato1, dato5],
│     │      'lugar': [dato2],
│     │      'nombre': [dato3],
│     │      'foto': [dato4]
│     │    }
│     │
│     ├─ C. Obtener LevelTemplates activas
│     │    templates = LevelTemplate.find({ active: true })
│     │
│     ├─ D. Por cada nivel (3 niveles):
│     │    │
│     │    ├─ Seleccionar template con datos disponibles
│     │    │  template = pickTemplate(dataType: 'fecha')
│     │    │
│     │    ├─ Crear Level
│     │    │  level = new Level({
│     │    │    title: "Recuerdos Románticos",
│     │    │    userId: targetUserId, // Carlos
│     │    │    gameSetId: gameSet._id
│     │    │  })
│     │    │
│     │    └─ Generar Challenges (3-5 por nivel)
│     │       generateChallenges(level, userdata, seed)
│     │       │
│     │       ├─ Seleccionar datos aleatorios (con seed)
│     │       │  selectedData = shuffle(userdata, seed).slice(0, 3)
│     │       │
│     │       ├─ Por cada dato:
│     │       │  │
│     │       │  ├─ Obtener ChallengeTemplate compatible
│     │       │  │  template = getChallengeTemplate(tipo: dato.tipoDato)
│     │       │  │
│     │       │  ├─ Generar pregunta y pistas
│     │       │  │  question = fillTemplate(
│     │       │  │    template.questionTemplate,
│     │       │  │    { evento: "nuestra primera cita" }
│     │       │  │  )
│     │       │  │  // "¿Cuándo fue nuestra primera cita?"
│     │       │  │
│     │       │  ├─ Hashear respuesta
│     │       │  │  { hash, salt } = hashAnswer(dato.valor)
│     │       │  │
│     │       │  └─ Crear Challenge
│     │       │     challenge = new Challenge({
│     │       │       type: 'date_guess',
│     │       │       question: "¿Cuándo fue nuestra primera cita?",
│     │       │       hints: dato.pistas,
│     │       │       answerHash: hash,
│     │       │       salt: salt,
│     │       │       levelId: level._id,
│     │       │       userId: targetUserId
│     │       │     })
│     │       │
│     │       └─ level.challenges.push(challenge._id)
│     │
│     └─ Return levels array [level1, level2, level3]
│
├─ 6. Actualizar GameSet con levels
│     gameSet.levels = [level1._id, level2._id, level3._id]
│     gameSet.save()
│
└─ 7. Actualizar GameInstance o User
      if (gameInstanceId) {
        GameInstance.update({ currentSetId: gameSet._id })
      } else {
        User.update({ currentSetId: gameSet._id })
      }
```

---

## 6. Sincronización entre Aplicaciones

### 6.1 Mobile App ↔ Backend

#### Autenticación y Sesión

```javascript
// Mobile: context/AuthContext.js

const [user, setUser] = useState(null);
const [token, setToken] = useState(null);

// Al iniciar app
useEffect(() => {
  AsyncStorage.getItem('token').then(token => {
    if (token) {
      // Validar token y obtener perfil
      api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setUser(response.data.user);
        setToken(token);
      });
    }
  });
}, []);

// Refresh token automático
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const { data } = await api.post('/auth/refresh', { refreshToken });
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      
      // Reintentar request original
      error.config.headers['Authorization'] = `Bearer ${data.token}`;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

#### Estados de Juego

```javascript
// Mobile: hooks/useGame.js

const useGame = () => {
  const [gameInstance, setGameInstance] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [progress, setProgress] = useState(0);

  // Sincronizar estado del juego
  const refreshGameState = async () => {
    const [instanceRes, progressRes, levelsRes] = await Promise.all([
      api.get('/api/share/my-instances'),
      api.get('/api/progress'),
      api.get('/api/levels')
    ]);

    setGameInstance(instanceRes.data.instances[0]);
    setProgress(progressRes.data.progress);
    // ... actualizar estado local
  };

  // Polling cada 30 segundos (si hay cambios)
  useEffect(() => {
    const interval = setInterval(refreshGameState, 30000);
    return () => clearInterval(interval);
  }, []);

  return { gameInstance, currentLevel, progress, refreshGameState };
};
```

#### Carga de Imágenes

```javascript
// Mobile: Subir imagen de dato personal

const uploadImage = async (uri, userId, dataType) => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: `${dataType}_${Date.now()}.jpg`
  });
  formData.append('userId', userId);

  const response = await api.post('/api/userdata/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.imagePath;
};

// Mostrar imagen desde backend
<Image 
  source={{ uri: `${API_URL}${imagePath}` }}
  style={styles.image}
/>
```

### 6.2 Backoffice ↔ Backend

#### React Query para Caché y Sincronización

```javascript
// Backoffice: hooks/useFetch.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Obtener categorías
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data.data.categories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Crear categoría
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData) => {
      const { data } = await api.post('/admin/categories', categoryData);
      return data;
    },
    onSuccess: () => {
      // Invalidar caché para refetch automático
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

// Uso en componente
const CategoriesPage = () => {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();

  const handleCreate = (newCategory) => {
    createMutation.mutate(newCategory);
  };

  return (
    <div>
      {isLoading ? <Spinner /> : <CategoryTable data={categories} />}
    </div>
  );
};
```

#### Sincronización en Tiempo Real (Opcional: WebSockets)

```javascript
// Backend: Agregar Socket.io (futuro)

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-game', (gameInstanceId) => {
    socket.join(`game-${gameInstanceId}`);
  });

  // Cuando se completa un challenge
  socket.on('challenge-completed', (data) => {
    io.to(`game-${data.gameInstanceId}`).emit('progress-update', {
      progress: data.progress
    });
  });
});

// Mobile: Conectar a socket
const socket = io(API_URL);

socket.on('progress-update', (data) => {
  setProgress(data.progress);
});
```

### 6.3 Flujo de Datos: Actualización de Datos Personales

```
CREADOR (Mobile)              BACKEND                 JUGADOR (Mobile)
     │                          │                          │
     ├─ PUT /api/userdata/:id   │                          │
     │  (Actualiza pregunta)    │                          │
     │                          │                          │
     │  ◄─────── 200 OK ────────┤                          │
     │                          │                          │
     │                          ├─ UserData.save()         │
     │                          │                          │
     │                          │  [Si hay juego activo]   │
     │                          │                          │
     │                          ├─ ⚠️ NO afecta GameSet    │
     │                          │    actual del jugador    │
     │                          │                          │
     │                          │  [En próximo set]        │
     │                          │                          │
     │                          ├─ generateNewGameSet()    │
     │                          │  └─ Usa nuevos datos ✅  │
     │                          │                          │
     ├─ [Próximo juego] ────────┤                          │
     │                          ├─── POST /api/reset ──────┤
     │                          │                          │
     │                          ├─ Genera nuevo GameSet    │
     │                          │  con datos actualizados  │
     │                          │                          │
     │                          ├──── 200 OK + GameSet ────►
     │                          │                          │
     │                          │                          ├─ Juega con
     │                          │                          │  datos nuevos
```

**Nota Importante:** Los cambios en UserData solo afectan a nuevos GameSets. Los juegos en curso mantienen su estado para evitar inconsistencias.

---

## 7. Seguridad y Permisos

### 7.1 Middleware de Autenticación

```javascript
// backend/src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verificar token JWT
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Verificar rol específico
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción'
      });
    }

    next();
  };
};

/**
 * Verificar propiedad de recurso
 */
const requireOwnership = (Model, paramKey = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramKey];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

      // Verificar si es el propietario
      if (resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No eres el propietario de este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error verificando propiedad',
        error: error.message
      });
    }
  };
};

module.exports = {
  verifyToken,
  requireRole,
  requireOwnership
};
```

### 7.2 Uso de Middlewares en Rutas

```javascript
// backend/src/routes/userdata.routes.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/userdata.controller');
const { verifyToken, requireRole, requireOwnership } = require('../middlewares/auth.middleware');
const { UserData } = require('../models');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Solo creadores pueden gestionar datos
router.use(requireRole('creator', 'admin'));

// Rutas públicas (para el rol)
router.get('/', controller.getUserData);
router.post('/', controller.createUserData);

// Rutas que requieren ownership
router.put('/:id', requireOwnership(UserData), controller.updateUserData);
router.delete('/:id', requireOwnership(UserData), controller.deleteUserData);

module.exports = router;
```

```javascript
// backend/src/routes/admin.routes.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Solo administradores
router.use(requireRole('admin'));

router.get('/templates', controller.getTemplates);
router.post('/templates', controller.createTemplate);
router.put('/templates/:id', controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);

router.get('/users', controller.getUsers);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

router.get('/stats', controller.getStats);

module.exports = router;
```

### 7.3 Seguridad de Respuestas

```javascript
// backend/src/models/User.model.js

// Ocultar campos sensibles al serializar
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

// backend/src/controllers/game.controller.js

const getChallenge = async (req, res) => {
  const challenge = await Challenge.findOne({
    _id: req.params.challengeId,
    userId: req.user._id
  });

  // NUNCA enviar hash ni salt al cliente
  const safeChallenge = challenge.toObject();
  delete safeChallenge.answerHash;
  delete safeChallenge.salt;

  res.json({
    success: true,
    data: { challenge: safeChallenge }
  });
};
```

### 7.4 Validación de Respuestas

```javascript
// backend/src/utils/hash.util.js

const crypto = require('crypto');

/**
 * Hashear respuesta con salt
 */
const hashAnswer = (answer) => {
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Normalizar respuesta
  const normalized = normalizeAnswer(answer);
  
  // Hash con salt
  const hash = crypto
    .pbkdf2Sync(normalized, salt, 10000, 64, 'sha512')
    .toString('hex');
  
  return { hash, salt };
};

/**
 * Verificar respuesta
 */
const verifyAnswer = (answer, hash, salt) => {
  const normalized = normalizeAnswer(answer);
  
  const candidateHash = crypto
    .pbkdf2Sync(normalized, salt, 10000, 64, 'sha512')
    .toString('hex');
  
  return candidateHash === hash;
};

/**
 * Normalizar respuesta (minúsculas, sin espacios, sin tildes)
 */
const normalizeAnswer = (answer) => {
  return answer
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/\s+/g, ''); // Quitar espacios
};

module.exports = {
  hashAnswer,
  verifyAnswer,
  normalizeAnswer
};
```

### 7.5 Rate Limiting (Futuro)

```javascript
// backend/src/middlewares/ratelimit.middleware.js

const rateLimit = require('express-rate-limit');

// Limitar intentos de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login. Intenta en 15 minutos.'
});

// Limitar intentos de verificación de respuestas
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 intentos
  message: 'Demasiados intentos. Espera un minuto.'
});

module.exports = { loginLimiter, verifyLimiter };

// Uso en rutas
router.post('/login', loginLimiter, authController.login);
router.post('/challenge/:id/verify', verifyLimiter, gameController.verifyChallenge);
```

---

## 8. Guía de Implementación

### 8.1 Checklist de Configuración Inicial

#### Backend

- [ ] Clonar repositorio
- [ ] Instalar dependencias: `npm install`
- [ ] Configurar `.env`:
  ```
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=your_secret_key
  JWT_REFRESH_SECRET=your_refresh_secret_key
  PORT=4000
  NODE_ENV=development
  ```
- [ ] Ejecutar seeds: `npm run seed`
- [ ] Iniciar servidor: `npm run dev`
- [ ] Verificar: `http://localhost:4000/health`

#### Mobile

- [ ] Instalar dependencias: `npm install`
- [ ] Configurar `.env`:
  ```
  API_URL=http://192.168.1.100:4000
  ```
- [ ] Iniciar Expo: `npm start`
- [ ] Escanear QR con Expo Go

#### Backoffice

- [ ] Instalar dependencias: `npm install`
- [ ] Configurar `.env`:
  ```
  VITE_API_URL=http://localhost:4000
  ```
- [ ] Iniciar dev server: `npm run dev`
- [ ] Abrir: `http://localhost:5173`

### 8.2 Seeds Iniciales

```javascript
// backend/src/seeds/seedAll.js

const seedAll = async () => {
  console.log('🌱 Iniciando seeds...');

  // 1. Crear admin
  const admin = await User.create({
    name: 'Administrador',
    email: 'admin@duochallenge.com',
    passwordHash: 'Admin123!',
    role: 'admin'
  });
  console.log('✅ Admin creado');

  // 2. Crear categorías
  await seedCategories();
  console.log('✅ Categorías creadas');

  // 3. Crear plantillas de nivel
  await seedLevelTemplates();
  console.log('✅ Level Templates creadas');

  // 4. Crear plantillas de desafío
  await seedChallengeTemplates();
  console.log('✅ Challenge Templates creadas');

  // 5. Crear premios del sistema
  await seedSystemPrizes();
  console.log('✅ Premios del sistema creados');

  // 6. Crear usuarios de prueba
  await seedTestUsers();
  console.log('✅ Usuarios de prueba creados');

  console.log('🎉 Seeds completados!');
};

module.exports = seedAll;
```

### 8.3 Pruebas de Flujo Completo

#### Prueba 1: Flujo del Creador

```bash
# 1. Registrar creador
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Creator",
    "email": "creator@test.com",
    "password": "Test123!",
    "role": "creator"
  }'

# 2. Login y guardar token
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@test.com","password":"Test123!"}' \
  | jq -r '.data.token')

# 3. Crear dato personal
curl -X POST http://localhost:4000/api/userdata \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoDato": "fecha_aniversario",
    "valor": "2020-05-15",
    "pregunta": "¿Cuándo fue nuestra primera cita?",
    "pistas": ["Fue en primavera", "Era un viernes"],
    "categorias": ["romántico"]
  }'

# 4. Crear premio
curl -X POST http://localhost:4000/api/prizes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cena romántica",
    "description": "Una cena en tu restaurante favorito",
    "category": "romántico",
    "weight": 8
  }'

# 5. Generar código
curl -X POST http://localhost:4000/api/share/create \
  -H "Authorization: Bearer $TOKEN"

# Resultado: { "code": "AB12CD" }
```

#### Prueba 2: Flujo del Jugador

```bash
# 1. Registrar jugador
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Player",
    "email": "player@test.com",
    "password": "Test123!",
    "role": "player"
  }'

# 2. Login
PLAYER_TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player@test.com","password":"Test123!"}' \
  | jq -r '.data.token')

# 3. Verificar código
curl -X GET http://localhost:4000/api/share/verify/AB12CD \
  -H "Authorization: Bearer $PLAYER_TOKEN"

# 4. Unirse al juego
curl -X POST http://localhost:4000/api/share/join \
  -H "Authorization: Bearer $PLAYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "AB12CD"}'

# 5. Obtener niveles
curl -X GET http://localhost:4000/api/levels \
  -H "Authorization: Bearer $PLAYER_TOKEN"

# 6. Responder challenge
curl -X POST http://localhost:4000/api/challenge/[CHALLENGE_ID]/verify \
  -H "Authorization: Bearer $PLAYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer": "2020-05-15"}'
```

### 8.4 Estructura de Archivos Recomendada

```
duochallenge-game/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── game.controller.js
│   │   │   ├── prize.controller.js
│   │   │   ├── share.controller.js
│   │   │   └── userdata.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── ratelimit.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models/
│   │   │   ├── Category.model.js
│   │   │   ├── Challenge.model.js
│   │   │   ├── ChallengeTemplate.model.js
│   │   │   ├── GameInstance.model.js
│   │   │   ├── GameSet.model.js
│   │   │   ├── GameShare.model.js
│   │   │   ├── Level.model.js
│   │   │   ├── LevelTemplate.model.js
│   │   │   ├── Prize.model.js
│   │   │   ├── User.model.js
│   │   │   ├── UserData.model.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── game.routes.js
│   │   │   ├── prize.routes.js
│   │   │   ├── share.routes.js
│   │   │   └── userdata.routes.js
│   │   ├── services/
│   │   │   ├── challenge.service.js
│   │   │   ├── gameset.service.js
│   │   │   ├── level.service.js
│   │   │   └── prize.service.js
│   │   ├── utils/
│   │   │   ├── hash.util.js
│   │   │   ├── seed.util.js
│   │   │   └── template.util.js
│   │   └── seeds/
│   │       ├── seedAll.js
│   │       ├── seedCategories.js
│   │       └── seedLevelTemplates.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── mobile/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── AppButton.js
│   │   │   ├── LoadingOverlay.js
│   │   │   └── ProgressBar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── hooks/
│   │   │   └── useGame.js
│   │   ├── navigation/
│   │   │   └── AppNavigator.js
│   │   └── screens/
│   │       ├── ChallengeScreen.js
│   │       ├── EditDataScreen.js
│   │       ├── HomeScreen.js
│   │       ├── JoinGameScreen.js
│   │       ├── LoginScreen.js
│   │       ├── MyDataScreen.js
│   │       ├── MyPrizesScreen.js
│   │       └── ShareScreen.js
│   ├── .env
│   ├── App.js
│   └── package.json
│
└── backoffice/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Layout/
    │   │   │   ├── MainLayout.jsx
    │   │   │   └── Sidebar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── UI/
    │   │       ├── DataTable.jsx
    │   │       ├── FileUploader.jsx
    │   │       └── Modal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   ├── useFetch.js
    │   │   └── useUpload.js
    │   ├── pages/
    │   │   ├── Categories.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── LevelTemplates.jsx
    │   │   ├── Login.jsx
    │   │   ├── Prizes.jsx
    │   │   ├── Templates.jsx
    │   │   └── Users.jsx
    │   ├── router/
    │   │   └── index.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── index.html
    └── package.json
```

### 8.5 Variables de Entorno

#### Backend `.env`

```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/duochallenge?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters

# Server
PORT=4000
NODE_ENV=development

# Frontend URLs (CORS)
FRONTEND_URL=http://localhost:5173

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

#### Mobile `.env`

```bash
# API
API_URL=http://192.168.1.100:4000

# Expo
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
```

#### Backoffice `.env`

```bash
# API
VITE_API_URL=http://localhost:4000
```

---

## 9. Consideraciones Futuras

### 9.1 Mejoras Técnicas

- [ ] Implementar WebSockets para actualizaciones en tiempo real
- [ ] Agregar Redis para caché de sesiones
- [ ] Implementar notificaciones push
- [ ] Migrar imágenes a S3/Cloudinary
- [ ] Agregar analytics con Mixpanel/Amplitude
- [ ] Implementar logs centralizados (Winston + CloudWatch)
- [ ] Tests unitarios y de integración (Jest + Supertest)
- [ ] CI/CD con GitHub Actions

### 9.2 Nuevas Funcionalidades

- [ ] Sistema de logros y badges
- [ ] Tabla de clasificación (leaderboard)
- [ ] Modo multijugador en tiempo real
- [ ] Chat integrado entre parejas
- [ ] Recordatorios personalizados
- [ ] Integración con redes sociales
- [ ] Modo offline para mobile
- [ ] Generación de reportes PDF
- [ ] Dashboard de analytics para creadores
- [ ] Sistema de suscripciones premium

### 9.3 Escalabilidad

```
┌─────────────────────────────────────────────────────┐
│          ARQUITECTURA ESCALABLE (FUTURO)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐                                      │
│  │  Mobile  │                                      │
│  │   App    │                                      │
│  └────┬─────┘                                      │
│       │                                            │
│       ▼                                            │
│  ┌──────────┐      ┌──────────┐                   │
│  │   CDN    │      │   Load   │                   │
│  │(Cloudflare)─────│ Balancer │                   │
│  └──────────┘      └────┬─────┘                   │
│                          │                         │
│              ┌───────────┴───────────┐             │
│              ▼                       ▼             │
│         ┌─────────┐             ┌─────────┐       │
│         │ API     │             │ API     │       │
│         │ Server 1│             │ Server 2│       │
│         └────┬────┘             └────┬────┘       │
│              │                       │             │
│              ├───────────┬───────────┤             │
│              ▼           ▼           ▼             │
│         ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│         │  Redis  │ │ MongoDB │ │   S3    │      │
│         │  Cache  │ │ Cluster │ │ Storage │      │
│         └─────────┘ └─────────┘ └─────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 10. Conclusión

Este documento técnico define la arquitectura completa del sistema DuoChallenge adaptada a tres roles:

✅ **Administrador:** Configura el sistema con plantillas y categorías  
✅ **Creador:** Personaliza datos y premios, comparte código  
✅ **Jugador:** Usa código para jugar con contenido personalizado

### Stack Completo

- **Backend:** Node.js + Express + MongoDB
- **Mobile:** React Native + Expo
- **Backoffice:** React + Vite

### Colecciones MongoDB

✅ 13 colecciones diseñadas y documentadas  
✅ Relaciones claras entre entidades  
✅ Índices optimizados

### API Endpoints

✅ 40+ endpoints documentados  
✅ Organizados por rol y funcionalidad  
✅ Ejemplos de request/response

### Flujos Completos

✅ Flujo del creador (subida → código)  
✅ Flujo del jugador (código → juego → premio)  
✅ Flujo del admin (configuración sistema)

### Seguridad

✅ JWT con refresh tokens  
✅ Middlewares de autorización  
✅ Hash de respuestas con salt  
✅ Ownership validation

---

**📅 Última actualización:** 2025-10-11  
**📧 Contacto:** team@duochallenge.com  
**🔗 Repositorio:** https://github.com/duochallenge/game

---

*Este documento es una guía viva que debe actualizarse con cada cambio importante en la arquitectura.*
