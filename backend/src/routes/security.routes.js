const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, securityController.getSessions);
router.delete('/:sessionId', requireAuth, securityController.revokeSession);

module.exports = router;
