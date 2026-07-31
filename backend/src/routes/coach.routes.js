const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coach.controller');

router.post('/', coachController.getReply);

module.exports = router;
