const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/stream/:userId', requireAuth, verifyOwnUserId, notificationController.stream);
router.get('/:userId', requireAuth, verifyOwnUserId, notificationController.getForUser);
router.put('/read-all/:userId', requireAuth, verifyOwnUserId, notificationController.markAllRead);

// NOTE: POST / creates a notification FOR a target user (req.body.user_id)
// that is NOT necessarily req.user — e.g. "X sent you a friend request"
// is created by X but delivered to the friend. Restricting user_id to
// req.user.id here would break that legitimate cross-user case, so this
// intentionally only requires login, not self-match. Tightening this
// properly (e.g. only allowing specific notification types to be created
// for other users) would mean changing notification.controller/service
// logic, which is out of scope for this pass.
router.post('/', requireAuth, notificationController.create);

// :id here is the notification's own id, not a userId — no ownership
// check possible without a DB lookup (out of scope, see note above).
router.put('/:id/read', requireAuth, notificationController.markRead);

module.exports = router;
