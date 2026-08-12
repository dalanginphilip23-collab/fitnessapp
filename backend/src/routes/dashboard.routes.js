const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/dashboard/:userId', requireAuth, verifyOwnUserId, dashboardController.getDashboard);
router.get('/search', requireAuth, dashboardController.search);

module.exports = router;
