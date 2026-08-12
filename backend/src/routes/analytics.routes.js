const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const analyticsController = require('../controllers/analytics.controller');

router.get('/summary/:userId', requireAuth, verifyOwnUserId, analyticsController.summary);
router.get('/zones/:userId', requireAuth, verifyOwnUserId, analyticsController.zones);
router.get('/vo2/:userId', requireAuth, verifyOwnUserId, analyticsController.vo2);

module.exports = router;
