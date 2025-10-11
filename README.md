# 🎮 DuoChallenge Game - Proyecto Completo

Juego móvil personalizado tipo duochallenge con backend Node.js, MongoDB y panel de administración.

## 📋 Documentación Técnica

### 📖 Documentos Principales

**🏗️ [ARQUITECTURA_SISTEMA_ROLES.md](./ARQUITECTURA_SISTEMA_ROLES.md)**  
Documento técnico completo con toda la arquitectura del sistema adaptada a los 3 roles de usuario (Administrador, Creador, Jugador). Incluye:
- Estructura completa de colecciones MongoDB
- Todos los endpoints del API documentados
- Flujos de trabajo completos
- Diagramas de arquitectura
- Guías de seguridad e implementación

**⚡ [RESUMEN_IMPLEMENTACION.md](./RESUMEN_IMPLEMENTACION.md)**  
Guía rápida de implementación. Quick start de 5 minutos para entender los 3 roles, endpoints clave y flujos principales.

**💻 [EJEMPLOS_CODIGO.md](./EJEMPLOS_CODIGO.md)**  
Ejemplos de código completos y funcionales para:
- Mobile App (React Native)
- Backoffice (React)
- Backend (Node.js)
- Tests unitarios

---

## 🎭 Los 3 Roles del Sistema

### 👑 Administrador
- **Acceso:** Solo Backoffice
- **Función:** Configura el sistema global (categorías, plantillas, premios por defecto)

### 🎨 Creador
- **Acceso:** Mobile App (principal)
- **Función:** Sube datos personales, crea premios personalizados, comparte código con su pareja

### 🎮 Jugador
- **Acceso:** Mobile App
- **Función:** Usa código compartido para jugar con los datos del creador

---

## 📁 Estructura del Proyecto

```
duochallenge-game/
├── backend/                    → API Node.js + Express
│   ├── src/
│   │   ├── models/            → 13 modelos MongoDB
│   │   ├── controllers/       → Lógica de negocio
│   │   ├── routes/            → 8 grupos de rutas
│   │   ├── services/          → Servicios (gameset, level, prize)
│   │   ├── middlewares/       → Auth, upload, roles
│   │   └── seeds/             → Datos iniciales
│   └── server.js
│
├── mobile/                     → App móvil Expo (React Native)
│   ├── src/
│   │   ├── screens/           → 12 pantallas
│   │   ├── components/        → Componentes reutilizables
│   │   ├── context/           → AuthContext, GameContext
│   │   ├── hooks/             → useGame, useAuth
│   │   └── api/               → Cliente API
│   └── App.js
│
├── backoffice/                 → Panel admin React + Vite
│   ├── src/
│   │   ├── pages/             → Categorías, Templates, Users, Stats
│   │   ├── components/        → DataTable, Modal, Layout
│   │   ├── hooks/             → useFetch (TanStack Query)
│   │   └── api/               → Cliente API
│   └── index.html
│
├── ARQUITECTURA_SISTEMA_ROLES.md    → 📖 Documentación técnica completa
├── RESUMEN_IMPLEMENTACION.md        → ⚡ Quick start guide
├── EJEMPLOS_CODIGO.md               → 💻 Code examples
└── README.md                         → Este archivo
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ 
- MongoDB Atlas (o local)
- Expo CLI (para mobile)
- Git

### 1. Backend

```bash
cd backend
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales de MongoDB

# Ejecutar seeds (datos iniciales)
npm run seed

# Iniciar servidor
npm run dev
# Servidor corriendo en http://localhost:4000
```

**Variables de entorno requeridas:**
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_clave_secreta_32_caracteres
JWT_REFRESH_SECRET=tu_clave_refresh_32_caracteres
PORT=4000
```

### 2. App Móvil

```bash
cd mobile
npm install

# Configurar .env
cp .env.example .env
# Editar API_URL con la IP de tu máquina

# Iniciar Expo
npm start
# Escanear QR con Expo Go (iOS/Android)
```

**Variables de entorno:**
```bash
API_URL=http://192.168.1.100:4000
```

### 3. Backoffice

```bash
cd backoffice
npm install

# Configurar .env
cp .env.example .env

# Iniciar dev server
npm run dev
# Abrir http://localhost:5173
```

**Variables de entorno:**
```bash
VITE_API_URL=http://localhost:4000
```

---

## 🔧 Tecnologías

| Componente | Stack |
|------------|-------|
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt |
| **Mobile** | React Native, Expo, Axios, AsyncStorage |
| **Backoffice** | React, Vite, TanStack Query, Axios |
| **Base de Datos** | MongoDB Atlas, 13 colecciones |
| **Autenticación** | JWT (Access + Refresh tokens) |
| **Validación** | Express Validator, Mongoose Schema |

---

## 🗄️ Base de Datos

### Colecciones Principales

```
users              → Usuarios (3 roles: admin, creator, player)
userdata           → Datos personales del creador
prizes             → Premios (sistema + personalizados)
gameshare          → Códigos de compartición
gameinstances      → Partidas activas jugador↔creador
gamesets           → Sets de juego (3-5 niveles)
levels             → Niveles de un set
challenges         → Desafíos de un nivel

[PLANTILLAS - Solo Admin]
categories         → Categorías de desafíos
leveltemplates     → Plantillas de niveles
challengetemplates → Plantillas de desafíos
```

Ver detalles completos en [ARQUITECTURA_SISTEMA_ROLES.md](./ARQUITECTURA_SISTEMA_ROLES.md#estructura-de-colecciones-mongodb)

---

## 🔌 API Endpoints

### Autenticación
```
POST   /auth/register         → Registrar usuario
POST   /auth/login            → Login
POST   /auth/refresh          → Refresh token
GET    /auth/profile          → Perfil actual
```

### Juego (Player/Creator)
```
GET    /api/levels            → Ver niveles
GET    /api/challenge/:id     → Obtener desafío
POST   /api/challenge/:id/verify → Verificar respuesta
GET    /api/progress          → Ver progreso
GET    /api/prize             → Ver premio ganado
POST   /api/reset             → Reiniciar juego
```

### Creador
```
GET    /api/userdata          → Ver datos personales
POST   /api/userdata          → Crear dato
POST   /api/prizes            → Crear premio
POST   /api/share/create      → Generar código
GET    /api/share/my-codes    → Ver códigos
```

### Jugador
```
GET    /api/share/verify/:code → Verificar código
POST   /api/share/join        → Unirse con código
GET    /api/share/my-instances → Mis partidas
```

### Admin
```
GET    /admin/categories      → Ver categorías
POST   /admin/categories      → Crear categoría
GET    /admin/level-templates → Ver plantillas de nivel
POST   /admin/templates       → Crear plantilla de desafío
GET    /admin/users           → Ver usuarios
GET    /admin/stats           → Estadísticas
```

Ver todos los endpoints en [ARQUITECTURA_SISTEMA_ROLES.md](./ARQUITECTURA_SISTEMA_ROLES.md#api-endpoints-por-rol)

---

## 🔄 Flujo de Uso Completo

### PASO 1: Creador Configura (5-10 min)
1. Registro con rol "creator"
2. Sube 5+ datos personales (fotos, fechas, lugares)
3. Crea 3+ premios personalizados
4. Genera código (ej: "AB12CD")
5. Comparte código con su pareja

### PASO 2: Jugador Se Une (2 min)
1. Registro con rol "player"
2. Ingresa código "AB12CD"
3. Se crea GameInstance automáticamente
4. Backend genera 3 niveles con 9 desafíos basados en los datos del creador

### PASO 3: Jugador Juega (10-15 min)
1. Responde desafíos nivel por nivel
2. Recibe pistas si falla
3. Completa todos los niveles
4. Desbloquea premio personalizado

Ver flujos detallados en [ARQUITECTURA_SISTEMA_ROLES.md](./ARQUITECTURA_SISTEMA_ROLES.md#flujos-de-trabajo-completos)

---

## 🧪 Testing

### Backend (cURL)

```bash
# Registrar creador
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!","role":"creator"}'

# Login y obtener token
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' \
  | jq -r '.data.token')

# Crear dato personal
curl -X POST http://localhost:4000/api/userdata \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipoDato":"fecha","valor":"2020-05-15","pregunta":"¿Cuándo?"}'
```

Ver más ejemplos en [EJEMPLOS_CODIGO.md](./EJEMPLOS_CODIGO.md)

---

## 📚 Recursos Adicionales

- **Postman Collection:** `backend/duochallenge_api_collection.json`
- **Seeds iniciales:** `backend/src/seeds/seedAll.js`
- **Documentación de modelos:** `backend/src/models/`

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar MongoDB
mongosh "tu_connection_string"

# Verificar puerto disponible
lsof -i :4000
```

### Mobile no conecta al backend
```bash
# Verificar API_URL en .env
# Debe ser IP local, NO localhost
# Ejemplo: http://192.168.1.100:4000

# Obtener tu IP
ipconfig getifaddr en0  # Mac
ip addr show           # Linux
ipconfig              # Windows
```

### "Token inválido"
- El token JWT expira en 24h
- Usar refresh token para renovar
- Ver implementación en [EJEMPLOS_CODIGO.md](./EJEMPLOS_CODIGO.md)

---

## 🎯 Próximos Pasos

### Inmediato
- [ ] Configurar MongoDB Atlas
- [ ] Ejecutar seeds iniciales
- [ ] Crear usuario admin
- [ ] Probar flujo completo

### Corto Plazo
- [ ] Implementar upload de imágenes
- [ ] Mejorar UI/UX mobile
- [ ] Agregar más plantillas de desafíos
- [ ] Tests unitarios

### Futuro
- [ ] WebSockets para tiempo real
- [ ] Notificaciones push
- [ ] Sistema de logros
- [ ] Deploy a producción

---

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

---

## 📧 Contacto

**Team DuoChallenge**  
- Email: team@duochallenge.com
- GitHub: [github.com/duochallenge](https://github.com/duochallenge)

---

## ❤️ Hecho con amor

Este proyecto fue creado para parejas que quieren fortalecer su relación a través de desafíos personalizados y divertidos.

**✨ ¡Disfruta jugando!**
