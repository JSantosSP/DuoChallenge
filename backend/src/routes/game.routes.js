const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/generate', gameController.generateGame);
router.post('/reset', gameController.resetGame);
router.get('/active', gameController.getActiveGames);
router.get('/history', gameController.getHistory);
router.get('/stats', gameController.getStats);

router.get('/:gameSetId/levels', gameController.getLevels);
router.get('/:gameSetId/progress', gameController.getProgress);
router.get('/level/:LevelId', gameController.getLevel);
router.post('/level/:levelId/verify', gameController.verifyLevel);

router.get('/prize', gameController.getPrize);

module.exports = router;