const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Gestión del juego
router.post('/generate', gameController.generateGame);
router.post('/reset', gameController.resetGame);
router.get('/progress', gameController.getProgress);

// Niveles y retos
router.get('/levels', gameController.getLevels);

// Premios
router.get('/prize', gameController.getPrize);

module.exports = router;