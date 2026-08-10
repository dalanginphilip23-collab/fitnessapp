const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');

// Public share link — no auth, unguessable token. MUST be registered before
// the catch-all '/:userId' below or Express will capture it as a userId.
router.get('/share/:token', activityController.getShared);

// In-app feed of friends' + own posts. Also must precede '/:userId'.
router.get('/feed/:userId', activityController.getFeed);
router.post('/feed/:activityId', activityController.createFeed);
router.delete('/feed/:postId', activityController.removeFeedPost);

// Saved location pins
router.get('/pins/:userId', activityController.getPins);
router.post('/pins/:userId', activityController.createPin);
router.delete('/pins/:id/:userId', activityController.removePin);

// Toggle public / get share link
router.patch('/:id/public', activityController.togglePublic);

router.post('/save', activityController.save);
router.get('/stats/:userId', activityController.getStats);
router.get('/detail/:id', activityController.getDetail);
router.get('/:userId', activityController.getAllForUser);
router.delete('/:id', activityController.remove);

module.exports = router;
