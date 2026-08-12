const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const dailyNutritionController = require('../controllers/dailyNutrition.controller');

router.post('/save-session/:userId', requireAuth, verifyOwnUserId, dailyNutritionController.saveSession);

module.exports = router;
