const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserIdBody = require('../middleware/verifyOwnUserIdBody');
const rateLimit = require('../middleware/rateLimit');
const clinicController = require('../controllers/clinic.controller');
const clinicService = require('../services/clinic.service');
const logger = require('../utils/logger');

// Ensures a clinic session belongs to the authenticated user (relies on
// req.user being set by requireAuth, which must run first). sessionId comes
// from the URL on /messages/:sessionId routes and from the body on /message.
async function ensureClinicSessionOwned(req, res, next) {
  const sessionId = req.body?.sessionId ?? req.params?.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session id' });
  }
  try {
    const owner = await clinicService.getSessionOwner(sessionId);
    if (!owner) return res.status(404).json({ error: 'Consultation not found' });
    if (String(owner) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own consultations' });
    }
    next();
  } catch (err) {
    logger.error('Clinic session ownership check failed:', err.message);
    res.status(500).json({ error: 'Could not verify consultation ownership' });
  }
}

router.post('/session', requireAuth, verifyOwnUserIdBody, clinicController.createOrGetSession);
router.post('/message', requireAuth, ensureClinicSessionOwned, rateLimit({ windowMs: 60 * 60 * 1000, max: 240 }), clinicController.sendMessage);
router.get('/messages/:sessionId', requireAuth, ensureClinicSessionOwned, clinicController.getMessages);
router.delete('/messages/:sessionId', requireAuth, ensureClinicSessionOwned, clinicController.resetChat);
router.get('/doctors/:category', requireAuth, clinicController.getDoctors);

module.exports = router;
