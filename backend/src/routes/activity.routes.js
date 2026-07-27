const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.post('/save', requireAuth, verifyOwnUserIdBody, activityController.save);
router.get('/stats/:userId', requireAuth, verifyOwnUserId, activityController.getStats);

// NOTE: /detail/:id and DELETE /:id identify an activity record by its own
// id, not by userId — there's no param here to check ownership against.
// requireAuth blocks anonymous access; verifying the record actually
// belongs to req.user would need a DB lookup inside the controller/service,
// which is a logic change and out of scope for this pass.
router.get('/detail/:id', requireAuth, activityController.getDetail);
router.get('/:userId', requireAuth, verifyOwnUserId, activityController.getAllForUser);
router.delete('/:id', requireAuth, activityController.remove);

module.exports = router;
