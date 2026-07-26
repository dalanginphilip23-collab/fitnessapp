const express = require('express');
const router = express.Router();
const messengerController = require('../controllers/messenger.controller');

router.get('/contacts/:userId', messengerController.getContacts);
router.get('/messages/:userId/:contactId', messengerController.getMessageHistory);
router.post('/messages', messengerController.sendMessage);
router.get('/users/search', messengerController.searchUsers);
router.post('/friends/add', messengerController.addFriend);

module.exports = router;
