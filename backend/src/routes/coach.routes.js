const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coach.controller');
const requireAuth = require('../middleware/requireAuth');

router.post('/', requireAuth, coachController.getReply);

module.exports = router;
