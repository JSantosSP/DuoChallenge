# 🎮 DuoChallenge Game - Proyecto Completo

Juego móvil personalizado tipo duochallenge con backend Node.js, MongoDB y panel de administración.

## 📁 Estructura del Proyecto

```
duochallenge-game/
├── backend/          → API Node.js + Express
├── mobile/           → App móvil Expo (React Native)
├── backoffice/       → Panel admin React + Vite
└── README.md         → Este archivo
```

## 🚀 Instalación y Configuración

### 1. Backend

```bash
cd backend
npm install
# Configurar .env con credenciales de MongoDB
npm run dev
```

### 2. App Móvil

```bash
cd mobile
npm install
# Configurar .env con URL del backend
npm start
```

### 3. Backoffice

```bash
cd backoffice
npm install
# Configurar .env con URL del backend
npm run dev
```

## 🔧 Tecnologías

- **Backend**: Node.js, Express, MongoDB, JWT, Bcrypt
- **Mobile**: Expo (React Native), Axios
- **Backoffice**: React, Vite, React Query
- **Base de datos**: MongoDB Atlas

## 📚 Documentación

Consulta los README individuales en cada carpeta para más detalles.

## 🎯 Próximos Pasos

1. Configurar MongoDB Atlas
2. Implementar modelos Mongoose
3. Crear endpoints del backend
4. Desarrollar pantallas de la app móvil
5. Construir panel de administración

## ❤️ Hecho con amor
