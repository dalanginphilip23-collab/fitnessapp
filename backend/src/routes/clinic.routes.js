const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.post('/session', requireAuth, verifyOwnUserIdBody, clinicController.createOrGetSession);

// NOTE: /message, /messages/:sessionId, and DELETE /messages/:sessionId
// identify things by sessionId, not userId — there's no userId param here
// to check against req.user. requireAuth blocks anonymous access; verifying
// that a given sessionId actually belongs to req.user would need a DB
// lookup inside clinic.controller/clinic.service (checking chat_sessions.
// user_id), which is a logic change and out of scope for this pass.
router.post('/message', requireAuth, clinicController.sendMessage);
router.get('/messages/:sessionId', requireAuth, clinicController.getMessages);
router.delete('/messages/:sessionId', requireAuth, clinicController.resetChat);

// Doctor directory is non-sensitive reference/catalog data — left public.
router.get('/doctors/:category', clinicController.getDoctors);

module.exports = router;
