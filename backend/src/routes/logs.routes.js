const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const logsController = require('../controllers/logs.controller');

router.post('/:userId', requireAuth, verifyOwnUserId, logsController.logActivity);
router.get('/history/:userId', requireAuth, verifyOwnUserId, logsController.getHistory);

module.exports = router;
