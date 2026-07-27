const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');

router.post('/session', clinicController.createOrGetSession);
router.post('/message', clinicController.sendMessage);
router.get('/messages/:sessionId', clinicController.getMessages);
router.delete('/messages/:sessionId', clinicController.resetChat);
router.get('/doctors/:category', clinicController.getDoctors);

module.exports = router;
