const express = require('express');
const router = express.Router();
const foodLogsController = require('../controllers/foodLogs.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

// Vision analysis — no userId involved, just login required (also protects
// the AI image-analysis call, and its cache, from anonymous use).
router.post('/analyze-pic', requireAuth, foodLogsController.analyzePic);

router.post('/:userId/suggest-plan', requireAuth, verifyOwnUserId, foodLogsController.suggestPlan);
router.post('/:userId', requireAuth, verifyOwnUserId, foodLogsController.createLog);
router.get('/:userId', requireAuth, verifyOwnUserId, foodLogsController.getLogs);
router.delete('/:userId/:mealId', requireAuth, verifyOwnUserId, foodLogsController.deleteLog);

module.exports = router;
