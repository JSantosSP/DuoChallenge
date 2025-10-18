const express = require('express');
const router = express.Router();
const prizeTemplateController = require('../controllers/prizeTemplate.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken);
router.use(checkRole('admin'));

// CRUD de plantillas de nivel
router.get('/', prizeTemplateController.getPrizeTemplates);
router.get('/:id', prizeTemplateController.getPrizeTemplateById);
router.post('/', prizeTemplateController.createPrizeTemplate);
router.put('/:id', prizeTemplateController.updatePrizeTemplate);
router.delete('/:id', prizeTemplateController.deletePrizeTemplate);

module.exports = router;
