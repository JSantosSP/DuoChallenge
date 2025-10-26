const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(verifyToken);
router.use(checkRole('admin'));

router.get('/variables', adminController.getVariables);
router.post('/variables', adminController.createVariable);
router.put('/variables/:id', adminController.updateVariable);
router.delete('/variables/:id', adminController.deleteVariable);

router.get('/prizes', adminController.getPrizes);
router.post('/prizes', adminController.createPrize);
router.put('/prizes/:id', adminController.updatePrize);
router.delete('/prizes/:id', adminController.deletePrize);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users/:id/reset', adminController.resetUserProgress);
router.get('/users/:id/userdata', adminController.getUserDataById);

router.post('/upload', upload.single('image'), adminController.uploadImage);

router.get('/stats', adminController.getStats);

router.get('/userdata', adminController.getAllUserData);
router.patch('/userdata/:id/toggle', adminController.toggleUserDataActive);


module.exports = router;