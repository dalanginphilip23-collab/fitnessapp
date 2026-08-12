const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const statsController = require('../controllers/stats.controller');

router.get('/daily/:userId', requireAuth, verifyOwnUserId, statsController.getDaily);

module.exports = router;
