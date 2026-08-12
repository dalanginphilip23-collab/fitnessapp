const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const rateLimit = require('../middleware/rateLimit');
const foodLogsController = require('../controllers/foodLogs.controller');

router.post('/analyze-pic', requireAuth, rateLimit({ windowMs: 60 * 60 * 1000, max: 60 }), foodLogsController.analyzePic);
router.post('/:userId/suggest-plan', requireAuth, verifyOwnUserId, foodLogsController.suggestPlan);
router.post('/:userId', requireAuth, verifyOwnUserId, foodLogsController.createLog);
router.get('/:userId', requireAuth, verifyOwnUserId, foodLogsController.getLogs);
router.delete('/:userId/:mealId', requireAuth, verifyOwnUserId, foodLogsController.deleteLog);

module.exports = router;
