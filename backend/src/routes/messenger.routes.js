const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');
const messengerController = require('../controllers/messenger.controller');

router.get('/contacts/:userId', requireAuth, verifyOwnUserId, messengerController.getContacts);
router.get('/messages/:userId/:contactId', requireAuth, verifyOwnUserId, messengerController.getMessageHistory);
router.post('/messages', requireAuth, verifyOwnUserIdBody, messengerController.sendMessage);
router.get('/users/search', requireAuth, messengerController.searchUsers);
router.post('/friends/add', requireAuth, verifyOwnUserIdBody, messengerController.addFriend);

module.exports = router;
