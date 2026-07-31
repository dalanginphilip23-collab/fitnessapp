const express = require('express');
const router = express.Router();
const dailyNutritionController = require('../controllers/dailyNutrition.controller');

router.post('/save-session/:userId', dailyNutritionController.saveSession);

module.exports = router;
