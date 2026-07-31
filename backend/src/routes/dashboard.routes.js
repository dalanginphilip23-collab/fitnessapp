const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/dashboard/:userId', dashboardController.getDashboard);
router.get('/search', dashboardController.search);

module.exports = router;
