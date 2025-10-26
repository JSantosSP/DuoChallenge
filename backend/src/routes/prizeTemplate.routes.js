const express = require('express');
const router = express.Router();
const prizeTemplateController = require('../controllers/prizeTemplate.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', prizeTemplateController.getPrizeTemplates);
router.get('/:id', prizeTemplateController.getPrizeTemplateById);

module.exports = router;
