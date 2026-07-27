const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/daily/:userId', statsController.getDaily);

module.exports = router;
