const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

// :userId is "the logged-in user's side" — checked against req.user.
// :friendId is the other participant and intentionally not restricted,
// same reasoning as messenger.routes.js.
router.get('/messages/:userId/:friendId', requireAuth, verifyOwnUserId, socialController.getMessages);

module.exports = router;
