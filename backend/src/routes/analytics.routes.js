const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/summary/:userId', requireAuth, verifyOwnUserId, analyticsController.summary);
router.get('/zones/:userId', requireAuth, verifyOwnUserId, analyticsController.zones);
router.get('/vo2/:userId', requireAuth, verifyOwnUserId, analyticsController.vo2);

module.exports = router;
