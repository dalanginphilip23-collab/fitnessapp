const express = require('express');
const router = express.Router();
const liveCoachingController = require('../controllers/liveCoaching.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.post('/sessions/:userId', requireAuth, verifyOwnUserId, liveCoachingController.startSession);
router.get('/sessions/:userId', requireAuth, verifyOwnUserId, liveCoachingController.getSessions);
router.get('/summary/:userId/:date', requireAuth, verifyOwnUserId, liveCoachingController.getDailySummary);

// NOTE: these three identify things by sessionId, not userId — no param
// here to check against req.user. requireAuth blocks anonymous access;
// verifying the sessionId actually belongs to req.user would need a DB
// lookup inside liveCoaching.controller/service (checking coaching_sessions.
// user_id), which is a logic change and out of scope for this pass.
router.patch('/sessions/:sessionId/end', requireAuth, liveCoachingController.endSession);
router.post('/sessions/:sessionId/reps', requireAuth, liveCoachingController.logRep);
router.get('/sessions/:sessionId/reps', requireAuth, liveCoachingController.getReps);

module.exports = router;
