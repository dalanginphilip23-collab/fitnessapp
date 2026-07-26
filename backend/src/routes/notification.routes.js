const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/stream/:userId', notificationController.stream);
router.get('/:userId', notificationController.getForUser);
router.post('/', notificationController.create);
router.put('/:id/read', notificationController.markRead);
router.put('/read-all/:userId', notificationController.markAllRead);

module.exports = router;
