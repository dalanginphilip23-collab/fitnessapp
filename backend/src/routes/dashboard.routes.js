const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/dashboard/:userId', requireAuth, verifyOwnUserId, dashboardController.getDashboard);
router.get('/search', requireAuth, dashboardController.search);

module.exports = router;
