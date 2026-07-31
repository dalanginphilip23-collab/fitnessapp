const express = require('express');
const router = express.Router();
const messengerController = require('../controllers/messenger.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.get('/contacts/:userId', requireAuth, verifyOwnUserId, messengerController.getContacts);
router.get('/messages/:userId/:contactId', requireAuth, verifyOwnUserId, messengerController.getMessageHistory);
router.post('/messages', requireAuth, messengerController.sendMessage);
router.get('/users/search', requireAuth, messengerController.searchUsers);
router.post('/friends/add', requireAuth, verifyOwnUserIdBody, messengerController.addFriend);

module.exports = router;
