const express = require('express');
const router = express.Router();
const levelTemplateController = require('../controllers/levelTemplate.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken);
router.use(checkRole('admin'));

// CRUD de plantillas de nivel
router.get('/', levelTemplateController.getLevelTemplates);
router.get('/data-types', levelTemplateController.getDataTypes);
router.get('/:id', levelTemplateController.getLevelTemplateById);
router.post('/', levelTemplateController.createLevelTemplate);
router.put('/:id', levelTemplateController.updateLevelTemplate);
router.delete('/:id', levelTemplateController.deleteLevelTemplate);

module.exports = router;
