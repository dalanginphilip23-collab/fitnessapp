const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const rateLimit = require('../middleware/rateLimit');
const coachController = require('../controllers/coach.controller');

// The camera coach can fire every ~2-3s during a workout, but a static cap
// still bounds quota abuse from automated clients.
router.post('/', requireAuth, rateLimit({ windowMs: 60 * 60 * 1000, max: 3000 }), coachController.getReply);

module.exports = router;
