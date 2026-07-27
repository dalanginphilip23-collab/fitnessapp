const express = require('express');
const router = express.Router();
const messengerController = require('../controllers/messenger.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.get('/contacts/:userId', requireAuth, verifyOwnUserId, messengerController.getContacts);

// :userId here is "the logged-in user's side of the conversation" — checked
// against req.user. :contactId is the other participant and is intentionally
// NOT restricted, since you're allowed to view your own conversation with
// any other user.
router.get('/messages/:userId/:contactId', requireAuth, verifyOwnUserId, messengerController.getMessageHistory);

// sendMessage identifies the sender via req.body.sender_id (not `userId`),
// so verifyOwnUserIdBody doesn't apply directly — same check, inline.
router.post(
  '/messages',
  requireAuth,
  (req, res, next) => {
    if (String(req.user.id) !== String(req.body.sender_id)) {
      return res.status(403).json({ error: 'Forbidden: sender_id must match your account' });
    }
    next();
  },
  messengerController.sendMessage
);

// Directory search — login required to stop anonymous scraping, no single
// user to check ownership against.
router.get('/users/search', requireAuth, messengerController.searchUsers);

router.post('/friends/add', requireAuth, verifyOwnUserIdBody, messengerController.addFriend);

module.exports = router;
