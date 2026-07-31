const express = require('express');
const router = express.Router();
const liveCoachingController = require('../controllers/liveCoaching.controller');

router.post('/sessions/:userId', liveCoachingController.startSession);
router.patch('/sessions/:sessionId/end', liveCoachingController.endSession);
router.post('/sessions/:sessionId/reps', liveCoachingController.logRep);
router.get('/sessions/:userId', liveCoachingController.getSessions);
router.get('/sessions/:sessionId/reps', liveCoachingController.getReps);
router.get('/summary/:userId/:date', liveCoachingController.getDailySummary);

module.exports = router;
