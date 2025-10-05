# 🎮 DuoChallenge Game - Proyecto Completo

> Un juego móvil personalizado tipo duochallenge con backend Node.js, base de datos MongoDB y panel de administración web.

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com)

---

## 📖 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación Rápida](#-instalación-rápida)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Descripción

DuoChallenge Game es un **juego móvil personalizado** diseñado para crear experiencias únicas tipo duochallenge con retos personalizados, niveles progresivos y premios sorpresa.

### ¿Para quién es este proyecto?

- 💑 Parejas que quieren crear experiencias únicas
- 🎁 Personas que buscan regalos creativos y personalizados
- 🎓 Educadores que quieren gamificar el aprendizaje
- 🎨 Creativos que disfrutan creando contenido interactivo

### ¿Qué hace especial a este proyecto?

- 🧩 **Retos Personalizables**: Crea retos basados en tus propias historias y recuerdos
- 🏆 **Sistema de Premios**: Recompensas aleatorias al completar todos los niveles
- 🔐 **Respuestas Seguras**: Hash SHA256 para proteger las soluciones
- 🎨 **Panel Admin**: Interfaz web intuitiva para gestionar todo el contenido
- 📱 **Multiplataforma**: App móvil compatible con iOS y Android (Expo)
- ♻️ **Regeneración Automática**: Nuevos retos y premios al completar cada ciclo

---

## ✨ Características

### 🎮 Para el Jugador

- ✅ Niveles progresivos con múltiples retos
- ✅ Diferentes tipos de retos (fechas, acertijos, lugares, puzzles)
- ✅ Sistema de pistas progresivas
- ✅ Límite de intentos por reto
- ✅ Premios aleatorios al completar el juego
- ✅ Tracking de progreso en tiempo real

### 👑 Para el Administrador

- ✅ Dashboard con estadísticas completas
- ✅ CRUD de plantillas de retos
- ✅ Gestión de variables personalizadas
- ✅ Gestión de premios con imágenes
- ✅ Visualización de progreso de usuarios
- ✅ Generación manual de juegos
- ✅ Reinicio de progreso
- ✅ Subida de imágenes

### 🔧 Técnicas

- ✅ Autenticación JWT con refresh tokens
- ✅ Roles de usuario (admin/player)
- ✅ Hashing seguro de respuestas
- ✅ API REST completa
- ✅ Base de datos MongoDB
- ✅ React Query para cache inteligente
- ✅ Diseño responsive

---

## 🛠️ Stack Tecnológico

### Backend
```
Node.js + Express
MongoDB + Mongoose
JWT + Bcrypt
Multer (uploads)
Crypto (hashing)
```

### Mobile App
```
Expo (React Native)
Axios
React Navigation
Expo Secure Store
```

### Backoffice (Admin Panel)
```
React 18.2
Vite
React Router DOM
React Hook Form
TanStack React Query
Tailwind CSS
```

---

## 📁 Estructura del Proyecto

```
duochallenge-game/
│
├── 📂 backend/              # API Node.js + Express
│   ├── src/
│   │   ├── models/          # Mongoose schemas (7 modelos)
│   │   ├── controllers/     # Lógica de negocio (3 controladores)
│   │   ├── routes/          # Rutas del API (30+ endpoints)
│   │   ├── services/        # Servicios de generación
│   │   ├── middlewares/     # Auth y upload
│   │   ├── utils/           # Utilidades (hash, templates, seed)
│   │   ├── config/          # Configuración BD
│   │   └── seeds/           # Datos iniciales
│   ├── uploads/             # Imágenes subidas
│   ├── .env
│   └── server.js
│
├── 📱 mobile/               # App móvil Expo
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   └── navigation/
│   └── App.js
│
├── 💻 backoffice/           # Panel de administración
│   ├── src/
│   │   ├── api/             # Axios config
│   │   ├── components/      # Componentes UI (10+)
│   │   ├── pages/           # Páginas (7 completas)
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # AuthContext
│   │   └── router/          # Configuración de rutas
│   └── package.json
│
├── 🚀 setup-project.sh      # Script de instalación automática
└── 📚 README.md             # Este archivo
```

---

## ⚡ Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/duochallenge-game.git
cd duochallenge-game

# 2. Dar permisos y ejecutar script
chmod +x setup-project.sh
./setup-project.sh

# 3. Configurar MongoDB URI
cd backend
nano .env  # Editar MONGO_URI

# 4. Instalar dependencias y seed
npm install
npm run seed

# 5. Iniciar backend
npm run dev
```

### Opción 2: Instalación Manual

#### Backend

```bash
cd backend
npm install

# Configurar .env
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/duochallenge
JWT_SECRET=tuClaveSecreta
JWT_REFRESH_SECRET=tuClaveRefresh

# Poblar base de datos
npm run seed

# Iniciar servidor
npm run dev
```

#### Backoffice

```bash
cd backoffice
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configurar .env
VITE_API_URL=http://localhost:4000

# Iniciar
npm run dev
```

#### Mobile App

```bash
cd mobile
npm install

# Configurar .env
EXPO_PUBLIC_API_URL=http://localhost:4000

# Iniciar
npm start
```

---

## 🎯 Uso

### 1️⃣ Acceder al Backoffice

```
URL: http://localhost:3000/login
Usuario: admin@duochallenge.com
Contraseña: admin123
```

### 2️⃣ Crear Contenido

1. **Variables**: Define valores personalizados (fechas, lugares, textos)
2. **Plantillas**: Crea plantillas de retos usando las variables
3. **Premios**: Añade premios con descripciones e imágenes

### 3️⃣ Generar Juego

1. Ve a "Usuarios"
2. Selecciona el jugador
3. Clic en "Generar Nuevo Juego"
4. El sistema creará niveles y retos automáticamente

### 4️⃣ Jugar en el Móvil

```
Usuario: player@duochallenge.com
Contraseña: player123
```

1. Inicia sesión en la app móvil
2. Verás los niveles disponibles
3. Completa los retos uno por uno
4. Al finalizar todos, recibirás un premio aleatorio
5. El sistema generará nuevos retos automáticamente

---

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────┐
│  Mobile App │
│   (Player)  │
└──────┬──────┘
       │
       │ API REST
       │ (JWT Auth)
       ▼
┌─────────────────┐
│   Backend API   │
│  Node + Express │
├─────────────────┤
│  • Auth         │
│  • Game Logic   │
│  • Challenge    │
│    Generation   │
│  • Prize System │
└────────┬────────┘
         │
         │ Mongoose
         ▼
┌─────────────────┐
│    MongoDB      │
│     Atlas       │
├─────────────────┤
│  • Users        │
│  • Challenges   │
│  • Levels       │
│  • Prizes       │
│  • GameSets     │
└─────────────────┘
         ▲
         │
         │ Axios
         │ (JWT Auth)
┌────────┴────────┐
│   Backoffice    │
│  React + Vite   │
│    (Admin)      │
└─────────────────┘
```

### Sistema de Generación de Retos

1. **Admin** crea plantillas con variables: `"¿Qué fecha fue {{evento}}?"`
2. **Backend** reemplaza variables: `"¿Qué fecha fue nuestra primera cita?"`
3. Sistema genera **hash SHA256** de la respuesta con salt
4. **Player** intenta resolver el reto
5. Backend compara hashes (nunca expone la respuesta real)
6. Al completar todos los retos → **asigna premio aleatorio**
7. Sistema **regenera** nuevo set de retos automáticamente

---

## 🔌 API Endpoints

### Autenticación
```
POST   /auth/register       # Registrar usuario
POST   /auth/login          # Iniciar sesión
POST   /auth/refresh        # Refresh token
GET    /auth/profile        # Obtener perfil
```

### Juego (Player)
```
POST   /api/generate        # Generar nuevo juego
GET    /api/levels          # Obtener niveles
GET    /api/challenge/:id   # Obtener reto
POST   /api/challenge/:id/verify  # Verificar respuesta
GET    /api/prize           # Obtener premio
POST   /api/reset           # Reiniciar juego
GET    /api/progress        # Ver progreso
```

### Admin
```
# Plantillas
GET    /admin/templates
POST   /admin/templates
PUT    /admin/templates/:id
DELETE /admin/templates/:id

# Variables
GET    /admin/variables
POST   /admin/variables
PUT    /admin/variables/:id
DELETE /admin/variables/:id

# Premios
GET    /admin/prizes
POST   /admin/prizes
PUT    /admin/prizes/:id
DELETE /admin/prizes/:id
POST   /admin/prizes/reset

# Usuarios
GET    /admin/users
GET    /admin/users/:id
POST   /admin/users/:id/generate
POST   /admin/users/:id/reset

# Utilidades
POST   /admin/upload        # Subir imagen
GET    /admin/stats         # Estadísticas
```

---

## 📸 Screenshots

### Backoffice - Dashboard
```
┌─────────────────────────────────────────────┐
│  🎮 DuoChallenge - Panel Admin               │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Dashboard                               │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │   👤    │ │   🧩    │ │   🏆    │      │
│  │ Usuarios│ │Plantillas│ │ Premios│      │
│  │    5    │ │    8    │ │   10   │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

### Mobile - Retos
```
┌───────────────────┐
│  🎮 Nivel 1       │
├───────────────────┤
│                   │
│  🧩 Reto #1       │
│                   │
│  ¿Qué fecha fue   │
│  nuestra primera  │
│  cita?            │
│                   │
│  ┌──────────────┐ │
│  │  Respuesta   │ │
│  └──────────────┘ │
│                   │
│  💡 Pista (3/5)   │
│                   │
│  [  Verificar  ]  │
│                   │
└───────────────────┘
```

---

## 🧪 Testing

### Backend
```bash
# Test manual con curl
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@duochallenge.com","password":"admin123"}'
```

### Backoffice
1. Login como admin
2. Crear variable
3. Crear plantilla
4. Crear premio
5. Generar juego para usuario
6. Verificar en base de datos

---

## 📚 Documentación Adicional

- 📖 [Guía de Instalación Completa](./INSTALLATION.md)
- 🔌 [Documentación del API](./API.md)
- 💻 [Guía del Backoffice](./backoffice/README.md)
- 📱 [Guía de la App Móvil](./mobile/README.md)
- 🗄️ [Esquemas de Base de Datos](./DATABASE.md)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Ideas para Contribuir

- [ ] Añadir más tipos de retos
- [ ] Implementar sistema de notificaciones
- [ ] Añadir tema oscuro al backoffice
- [ ] Implementar gráficas de estadísticas
- [ ] Añadir exportación/importación de datos
- [ ] Mejorar la app móvil con animaciones
- [ ] Implementar sistema de chat
- [ ] Añadir multi-idioma

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor:

1. Verifica que no esté ya reportado en Issues
2. Crea un nuevo Issue con:
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, Node version, etc.)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

Creado con ❤️ para crear experiencias únicas y personalizadas.

---

## 🙏 Agradecimientos

- MongoDB Atlas por su tier gratuito
- Expo por facilitar el desarrollo móvil
- La comunidad de React y Node.js
- A ti por usar este proyecto ❤️

---

## 📞 Soporte

¿Necesitas ayuda?

- 📧 Email: support@duochallenge.com
- 💬 Discord: [Únete al servidor](https://discord.gg/ejemplo)
- 📖 Wiki: [Documentación completa](https://github.com/tu-usuario/duochallenge-game/wiki)

---

## ⭐ ¿Te gustó el proyecto?

Si este proyecto te resultó útil, ¡dale una estrella! ⭐

También puedes:
- 🔄 Compartirlo con otros
- 🐛 Reportar bugs
- 💡 Sugerir nuevas funcionalidades
- 🤝 Contribuir con código

---

**Hecho con ❤️ para crear momentos inolvidables** 🎮

---

## 📊 Estado del Proyecto

![Status](https://img.shields.io/badge/Status-Completo-green.svg)
![Backend](https://img.shields.io/badge/Backend-100%25-success.svg)
![Backoffice](https://img.shields.io/badge/Backoffice-100%25-success.svg)
![Mobile](https://img.shields.io/badge/Mobile-Estructura-yellow.svg)
![Docs](https://img.shields.io/badge/Docs-Completa-blue.svg)