const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const sleepController = require('../controllers/sleep.controller');

router.post('/:userId', requireAuth, verifyOwnUserId, sleepController.create);
router.get('/:userId/today', requireAuth, verifyOwnUserId, sleepController.getToday);
router.get('/:userId', requireAuth, verifyOwnUserId, sleepController.getGraph);
router.get('/:userId/analysis', requireAuth, verifyOwnUserId, sleepController.getAnalysis);
router.get('/:userId/scatter', requireAuth, verifyOwnUserId, sleepController.getScatter);

module.exports = router;
