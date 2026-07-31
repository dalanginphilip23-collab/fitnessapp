const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.post('/analyze-pose', requireAuth, aiController.analyzePose);
router.post('/ai-chat', requireAuth, aiController.chat);
router.post('/ai/clinical-analysis', requireAuth, verifyOwnUserIdBody, aiController.clinicalAnalysis);
router.post('/ai/coach', requireAuth, aiController.coach);
router.get('/ai/history/:userId', requireAuth, verifyOwnUserId, aiController.history);
router.get('/logs/latest/:userId', requireAuth, verifyOwnUserId, aiController.latestLogs);
router.post('/ai/run-analysis', requireAuth, verifyOwnUserIdBody, aiController.runAnalysis);

module.exports = router;
