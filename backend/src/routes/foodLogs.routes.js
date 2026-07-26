const express = require('express');
const router = express.Router();
const foodLogsController = require('../controllers/foodLogs.controller');

router.post('/analyze-pic', foodLogsController.analyzePic);
router.post('/:userId/suggest-plan', foodLogsController.suggestPlan);
router.post('/:userId', foodLogsController.createLog);
router.get('/:userId', foodLogsController.getLogs);
router.delete('/:userId/:mealId', foodLogsController.deleteLog);

module.exports = router;
