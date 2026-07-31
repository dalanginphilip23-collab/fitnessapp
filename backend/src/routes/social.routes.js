const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/messages/:userId/:friendId', requireAuth, verifyOwnUserId, socialController.getMessages);

module.exports = router;
