const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken);

// CRUD de categorías
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;
