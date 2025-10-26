const express = require('express');
const router = express.Router();
const shareController = require('../controllers/share.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/create', shareController.createShareCode);
router.get('/codes', shareController.getUserShareCodes);
router.get('/used-codes', shareController.getUserUsedShareCodes);
router.get('/verify/:code', shareController.verifyShareCode);
router.post('/join', shareController.joinGame);
router.get('/instances', shareController.getGameInstances);
router.delete('/:id', shareController.deactivateShareCode);

module.exports = router;