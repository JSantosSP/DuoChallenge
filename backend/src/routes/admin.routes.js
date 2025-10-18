const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken);
router.use(checkRole('admin'));


// Gestión de variables
router.get('/variables', adminController.getVariables);
router.post('/variables', adminController.createVariable);
router.put('/variables/:id', adminController.updateVariable);
router.delete('/variables/:id', adminController.deleteVariable);

// Gestión de premios
router.get('/prizes', adminController.getPrizes);
router.post('/prizes', adminController.createPrize);
router.put('/prizes/:id', adminController.updatePrize);
router.delete('/prizes/:id', adminController.deletePrize);

// Gestión de usuarios
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users/:id/reset', adminController.resetUserProgress);
router.get('/users/:id/userdata', adminController.getUserDataById);

// Subida de imágenes
router.post('/upload', upload.single('image'), adminController.uploadImage);

// Estadísticas
router.get('/stats', adminController.getStats);

// Datos de usuarios (read-only para admin)
router.get('/userdata', adminController.getAllUserData);
router.patch('/userdata/:id/toggle', adminController.toggleUserDataActive);


module.exports = router;