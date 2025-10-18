const express = require('express');
const router = express.Router();
const prizeTemplateController = require('../controllers/prizeTemplate.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken);

// CRUD de plantillas de nivel
router.get('/', prizeTemplateController.getPrizeTemplates);
router.get('/:id', prizeTemplateController.getPrizeTemplateById);

module.exports = router;
