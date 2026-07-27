const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

// No userId involved — just login required (also protects your Gemini/Groq
// usage from anonymous callers).
router.post('/analyze-pose', requireAuth, aiController.analyzePose);
router.post('/ai/coach', requireAuth, aiController.coach);

router.post('/ai-chat', requireAuth, verifyOwnUserIdBody, aiController.chat);
router.post('/ai/clinical-analysis', requireAuth, verifyOwnUserIdBody, aiController.clinicalAnalysis);
router.post('/ai/run-analysis', requireAuth, verifyOwnUserIdBody, aiController.runAnalysis);

router.get('/ai/history/:userId', requireAuth, verifyOwnUserId, aiController.history);
router.get('/logs/latest/:userId', requireAuth, verifyOwnUserId, aiController.latestLogs);

module.exports = router;
