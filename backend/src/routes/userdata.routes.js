const express = require('express');
const router = express.Router();
const userDataController = require('../controllers/userdata.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/types', userDataController.getAvailableTypes);
router.get('/', userDataController.getUserData);
router.post('/', userDataController.createUserData);
router.put('/:id', userDataController.updateUserData);
router.delete('/:id', userDataController.deleteUserData);

module.exports = router;