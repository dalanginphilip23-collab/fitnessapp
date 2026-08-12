const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const socialController = require('../controllers/social.controller');

router.get('/messages/:userId/:friendId', requireAuth, verifyOwnUserId, socialController.getMessages);

module.exports = router;
