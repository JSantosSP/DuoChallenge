# Backend - DuoChallenge Game

## Instalación

```bash
npm install
```

## Configuración

1. Edita el archivo `.env` con tus credenciales de MongoDB
2. Asegúrate de tener MongoDB Atlas configurado

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Estructura

```
src/
├── models/       → Esquemas Mongoose
├── routes/       → Definición de rutas
├── controllers/  → Lógica de negocio
├── middlewares/  → Autenticación, validación
├── services/     → Generadores de retos, premios
└── utils/        → Funciones auxiliares
```
