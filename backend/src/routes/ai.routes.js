const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/analyze-pose', aiController.analyzePose);
router.post('/ai-chat', aiController.chat);
router.post('/ai/clinical-analysis', aiController.clinicalAnalysis);
router.post('/ai/coach', aiController.coach);
router.get('/ai/history/:userId', aiController.history);
router.get('/logs/latest/:userId', aiController.latestLogs);
router.post('/ai/run-analysis', aiController.runAnalysis);

module.exports = router;
