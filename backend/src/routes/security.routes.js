const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const securityController = require('../controllers/security.controller');

router.get('/', requireAuth, securityController.getSessions);
router.delete('/:sessionId', requireAuth, securityController.revokeSession);

module.exports = router;
