const express = require('express');
const router = express.Router();
const rateLimit = require('../middleware/rateLimit');
const feedbackController = require('../controllers/feedback.controller');

// Public, but rate-limited so it can't be abused to flood the inbox.
router.post('/', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), feedbackController.submitFeedback);

module.exports = router;
