const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prize.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', prizeController.getUserPrizes);
router.post('/', prizeController.createPrize);
router.put('/:id', prizeController.updatePrize);
router.delete('/:id', prizeController.deletePrize);

module.exports = router;