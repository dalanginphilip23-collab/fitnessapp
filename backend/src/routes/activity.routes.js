const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.post('/save', requireAuth, verifyOwnUserIdBody, activityController.save);
router.get('/stats/:userId', requireAuth, verifyOwnUserId, activityController.getStats);
router.get('/detail/:id', requireAuth, activityController.getDetail);
router.get('/:userId', requireAuth, verifyOwnUserId, activityController.getAllForUser);
router.delete('/:id', requireAuth, activityController.remove);

module.exports = router;
