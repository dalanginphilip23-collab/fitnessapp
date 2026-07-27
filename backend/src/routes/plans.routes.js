const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plans.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.post('/enroll', requireAuth, verifyOwnUserIdBody, plansController.enroll);
router.post('/progress/complete', requireAuth, verifyOwnUserIdBody, plansController.completeDay);
router.get('/progress/:userId/:planId', requireAuth, verifyOwnUserId, plansController.getProgress);

// Plan content is catalog/reference data (the workout schedule itself, not
// user-specific) — login required, no per-user ownership to check.
router.get('/content/:planId', requireAuth, plansController.getContent);

router.get('/:userId', requireAuth, verifyOwnUserId, plansController.getMarketplace);

module.exports = router;
