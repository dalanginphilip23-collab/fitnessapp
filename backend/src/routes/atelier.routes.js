const express = require('express');
const router = express.Router();
const atelierController = require('../controllers/atelier.controller');
const requireAuth = require('../middleware/requireAuth');
const verifyOwnUserId = require('../middleware/verifyOwnUserId');

router.get('/summary/:userId', requireAuth, verifyOwnUserId, atelierController.summary);

module.exports = router;
