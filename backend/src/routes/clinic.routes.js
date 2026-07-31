const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');

router.post('/session', requireAuth, verifyOwnUserIdBody, clinicController.createOrGetSession);
router.post('/message', requireAuth, clinicController.sendMessage);
router.get('/messages/:sessionId', requireAuth, clinicController.getMessages);
router.delete('/messages/:sessionId', requireAuth, clinicController.resetChat);
router.get('/doctors/:category', requireAuth, clinicController.getDoctors);

module.exports = router;
