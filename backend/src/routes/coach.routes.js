const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coach.controller');
const requireAuth = require('../middleware/requireAuth');

// No userId involved — login required so this AI proxy can't be hit
// anonymously (cost/abuse control on the underlying AI call).
router.post('/', requireAuth, coachController.getReply);

module.exports = router;
