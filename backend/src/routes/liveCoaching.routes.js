const express = require('express');
const router = express.Router();
const liveCoachingController = require('../controllers/liveCoaching.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.post('/sessions/:userId', requireAuth, verifyOwnUserId, liveCoachingController.startSession);
router.patch('/sessions/:sessionId/end', requireAuth, liveCoachingController.endSession);
router.post('/sessions/:sessionId/reps', requireAuth, liveCoachingController.logRep);
router.get('/sessions/:userId', requireAuth, verifyOwnUserId, liveCoachingController.getSessions);
router.get('/sessions/:sessionId/reps', requireAuth, liveCoachingController.getReps);
router.get('/summary/:userId/:date', requireAuth, verifyOwnUserId, liveCoachingController.getDailySummary);

module.exports = router;
