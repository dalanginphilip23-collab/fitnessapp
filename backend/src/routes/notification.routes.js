const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.get('/stream/:userId', requireAuth, verifyOwnUserId, notificationController.stream);
router.get('/:userId', requireAuth, verifyOwnUserId, notificationController.getForUser);
router.post('/', requireAuth, verifyOwnUserIdBody, notificationController.create);
router.put('/:id/read', requireAuth, notificationController.markRead);
router.put('/read-all/:userId', requireAuth, verifyOwnUserId, notificationController.markAllRead);

module.exports = router;
