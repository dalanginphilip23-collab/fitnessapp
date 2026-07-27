const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/daily/:userId', requireAuth, verifyOwnUserId, statsController.getDaily);

module.exports = router;
