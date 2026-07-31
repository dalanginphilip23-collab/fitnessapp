const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/summary/:userId', analyticsController.summary);
router.get('/zones/:userId', analyticsController.zones);
router.get('/vo2/:userId', analyticsController.vo2);

module.exports = router;
