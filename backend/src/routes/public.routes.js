const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const rateLimit = require('../middleware/rateLimit');

router.get('/stats', rateLimit({ windowMs: 60 * 1000, max: 30 }), publicController.getStats);

module.exports = router;
