const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.post('/:userId', requireAuth, verifyOwnUserId, logsController.logActivity);
router.get('/history/:userId', requireAuth, verifyOwnUserId, logsController.getHistory);

module.exports = router;
