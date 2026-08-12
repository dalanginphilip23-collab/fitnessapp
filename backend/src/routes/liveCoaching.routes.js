const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const liveCoachingController = require('../controllers/liveCoaching.controller');
const liveCoachingService = require('../services/liveCoaching.service');

// Ensures the :sessionId belongs to the authenticated user.
async function ensureCoachingSessionOwned(req, res, next) {
  const { sessionId } = req.params;
  try {
    const owner = await liveCoachingService.getSessionOwner(sessionId);
    if (!owner) return res.status(404).json({ error: 'Session not found' });
    if (String(owner) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own sessions' });
    }
    next();
  } catch (err) {
    console.error('Coaching session ownership check failed:', err.message);
    res.status(500).json({ error: 'Could not verify session ownership' });
  }
}

router.post('/sessions/:userId', requireAuth, verifyOwnUserId, liveCoachingController.startSession);
router.patch('/sessions/:sessionId/end', requireAuth, ensureCoachingSessionOwned, liveCoachingController.endSession);
router.post('/sessions/:sessionId/reps', requireAuth, ensureCoachingSessionOwned, liveCoachingController.logRep);
router.get('/sessions/:userId', requireAuth, verifyOwnUserId, liveCoachingController.getSessions);
router.get('/sessions/:sessionId/reps', requireAuth, ensureCoachingSessionOwned, liveCoachingController.getReps);
router.get('/summary/:userId/:date', requireAuth, verifyOwnUserId, liveCoachingController.getDailySummary);

module.exports = router;
