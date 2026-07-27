const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/dashboard/:userId', requireAuth, verifyOwnUserId, dashboardController.getDashboard);

// User search — login required to stop anonymous scraping of your user
// directory, no single-user ownership to check (it searches across users).
router.get('/search', requireAuth, dashboardController.search);

module.exports = router;
