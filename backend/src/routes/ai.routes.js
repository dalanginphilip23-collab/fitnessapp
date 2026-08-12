const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');
const rateLimit = require('../middleware/rateLimit');
const aiController = require('../controllers/ai.controller');

// These call paid AI providers — rate-limit per user to cap quota abuse.
const hour = 60 * 60 * 1000;

router.post('/analyze-pose', requireAuth, rateLimit({ windowMs: hour, max: 600 }), aiController.analyzePose);
router.post('/ai-chat', requireAuth, rateLimit({ windowMs: hour, max: 240 }), aiController.chat);
router.post('/ai/clinical-analysis', requireAuth, verifyOwnUserIdBody, rateLimit({ windowMs: hour, max: 240 }), aiController.clinicalAnalysis);
router.post('/ai/coach', requireAuth, rateLimit({ windowMs: hour, max: 3000 }), aiController.coach);
router.get('/ai/history/:userId', requireAuth, verifyOwnUserId, aiController.history);
router.get('/logs/latest/:userId', requireAuth, verifyOwnUserId, aiController.latestLogs);
router.post('/ai/run-analysis', requireAuth, verifyOwnUserIdBody, rateLimit({ windowMs: hour, max: 120 }), aiController.runAnalysis);

module.exports = router;
