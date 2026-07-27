const express = require('express');
const router = express.Router();
const dailyNutritionController = require('../controllers/dailyNutrition.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.post('/save-session/:userId', requireAuth, verifyOwnUserId, dailyNutritionController.saveSession);

module.exports = router;
