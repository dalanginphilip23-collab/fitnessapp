const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');
const activityController = require('../controllers/activity.controller');

// Public share link — no auth, unguessable token. MUST be registered before
// the catch-all '/:userId' below or Express will capture it as a userId.
router.get('/share/:token', activityController.getShared);

// In-app feed of friends' + own posts. Also must precede '/:userId'.
router.get('/feed/:userId', requireAuth, verifyOwnUserId, activityController.getFeed);
router.post('/feed/:activityId', requireAuth, verifyOwnUserIdBody, activityController.createFeed);
router.delete('/feed/:postId', requireAuth, verifyOwnUserIdBody, activityController.removeFeedPost);

// Saved location pins
router.get('/pins/:userId', requireAuth, verifyOwnUserId, activityController.getPins);
router.post('/pins/:userId', requireAuth, verifyOwnUserId, activityController.createPin);
router.delete('/pins/:id/:userId', requireAuth, verifyOwnUserId, activityController.removePin);

// Toggle public / get share link
router.patch('/:id/public', requireAuth, verifyOwnUserIdBody, activityController.togglePublic);

router.post('/save', requireAuth, verifyOwnUserIdBody, activityController.save);
router.get('/stats/:userId', requireAuth, verifyOwnUserId, activityController.getStats);
router.get('/detail/:id', requireAuth, activityController.getDetail);
router.get('/:userId', requireAuth, verifyOwnUserId, activityController.getAllForUser);
router.delete('/:id', requireAuth, activityController.remove);

module.exports = router;
